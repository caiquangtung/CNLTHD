import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
    Inject,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, EntityManager } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
    mapCreateOrderDtoToEntity,
    mapCreateOrderItemDtoToEntity,
    mapOrderToResponseDto,
} from './mappers/order.mapper';
import { TicketType } from '../ticket-types/entities';
import { Payment, PaymentStatus } from '../payments/entities';
import { VnpayService } from '../payments/vnpay.service';
import { OrderResponseDto } from './dto';

const MAX_PENDING_ORDERS = 2;
const PAYMENT_DEADLINE_MINUTES = 5;

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemsRepo: Repository<OrderItem>,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(VnpayService) private vnpayService: VnpayService,
    ) { }

    async create(dto: CreateOrderDto, userId: string, ipAddr?: string): Promise<OrderResponseDto> {
        return await this.dataSource.transaction(async (manager) => {
            // 1. Check PENDING count bên trong transaction để an toàn tuyệt đối
            const pendingCount = await manager.count(Order, {
                where: { userId, status: OrderStatus.PENDING },
            });

            if (pendingCount >= MAX_PENDING_ORDERS) {
                throw new BadRequestException(
                    `Bạn đã có ${pendingCount} đơn hàng đang chờ thanh toán. Vui lòng hoàn thành hoặc hủy trước khi tạo đơn mới.`
                );
            }

            const order = mapCreateOrderDtoToEntity(dto);
            order.userId = userId;
            order.status = OrderStatus.PENDING;
            order.paymentDeadline = new Date(Date.now() + PAYMENT_DEADLINE_MINUTES * 60 * 1000);

            let totalAmount = 0;

            for (const item of order.orderItems) {
                // Lock dòng này lại để không ai khác có thể trừ kho cùng lúc
                const ticketType = await manager.findOne(TicketType, {
                    where: { id: item.ticketTypeId },
                    lock: { mode: 'pessimistic_write' }
                });

                if (!ticketType) throw new NotFoundException(`Loại vé không tồn tại`);

                // Kiểm tra số lượng còn lại
                if (ticketType.quantity < item.quantity) {
                    throw new BadRequestException(`Vé ${ticketType.name} không đủ số lượng (còn ${ticketType.quantity})`);
                }

                // Trừ kho
                ticketType.quantity -= item.quantity;
                await manager.save(ticketType);

                item.unitPrice = ticketType.price;
                totalAmount += Number(ticketType.price) * item.quantity;
            }

            order.totalAmount = totalAmount;

            // Tạo Payment đính kèm
            order.payment = manager.create(Payment, {
                amount: totalAmount,
                status: PaymentStatus.PENDING,
                paymentMethod: dto.paymentMethod,
            });

            const savedOrder = await manager.save(order); // Lưu toàn bộ Order + Items + Payment

            // 2. Map từ savedOrder (đã có ID từ DB)
            const responseDto = mapOrderToResponseDto(savedOrder);

            // 3. Gắn Payment URL
            responseDto.paymentUrl = this.vnpayService.buildPaymentUrl(
                savedOrder.id,
                Number(savedOrder.totalAmount),
                `Thanh toan don hang ${savedOrder.id}`,
                ipAddr || '127.0.0.1',
            );

            return responseDto;
        });
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepo.find({ relations: ['orderItems'], order: { createdAt: 'DESC' } });
    }

    async findAllPaged(page: number = 1, limit: number = 10): Promise<{ data: Order[], total: number, page: number, limit: number }> {
        const skip = (page - 1) * limit;
        const [orders, total] = await this.ordersRepo.findAndCount({
            relations: ['orderItems'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return { data: orders, total, page, limit };
    }

    async findByUserId(userId: string): Promise<Order[]> {
        return this.ordersRepo.find({
            where: { userId },
            relations: ['orderItems'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<Order> {
        const order = await this.ordersRepo.findOne({
            where: { id },
            relations: ['orderItems'],
        });
        if (!order) {
            throw new NotFoundException(`Order with id "${id}" not found`);
        }
        return order;
    }

    /**
     * Cancel pending order and restore inventory
     */
    async cancelOrder(id: string, userId: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            // 1. Tìm Order ngay trong transaction và LOCK dòng này lại
            // Đồng thời load luôn orderItems để restore inventory
            const order = await manager.findOne(Order, {
                where: { id },
                relations: ['orderItems'],
                lock: { mode: 'pessimistic_write' }
            });

            if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

            if (order.userId !== userId) {
                throw new ForbiddenException('Bạn chỉ có thể hủy đơn hàng của chính mình');
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(`Không thể hủy đơn hàng ở trạng thái ${order.status}`);
            }

            // 2. Thực hiện hoàn kho (Dùng hàm tối ưu của bạn)
            await this.restoreInventory(manager, order.orderItems);

            // 3. Cập nhật trạng thái Order
            order.status = OrderStatus.CANCELLED;
            order.cancelReason = 'Khách hàng hủy';
            await manager.save(order);

            // 4. Cập nhật trạng thái Payment riêng
            if (order.payment) {
                await manager.update(Payment, { orderId: id }, { status: PaymentStatus.CANCELLED });
            }
        });
    }

    /**
     * Hoàn kho cho các order items
     */
    private async restoreInventory(manager: EntityManager, items: OrderItem[]): Promise<void> {
        const promises = items.map(item =>
            manager.increment(
                TicketType,
                { id: item.ticketTypeId },
                'quantity',
                item.quantity
            )
        );
        await Promise.all(promises);
    }

    /**
     * Tự động cancel các order PENDING quá hạn thanh toán (gọi từ cron job)
     */
    async cancelExpiredOrders(): Promise<number> {
        const now = new Date();
        const expiredOrders = await this.ordersRepo.find({
            where: {
                status: OrderStatus.PENDING,
                paymentDeadline: LessThan(now),
            },
            relations: ['orderItems', 'payment'],
        });

        let cancelledCount = 0;
        for (const order of expiredOrders) {
            try {
                await this.dataSource.transaction(async (manager) => {
                    await this.restoreInventory(manager, order.orderItems);

                    order.status = OrderStatus.CANCELLED;
                    order.cancelReason = 'Vượt quá hạn thanh toán';
                    await manager.save(order);

                    if (order.payment) {
                        await manager.update(Payment, { orderId: order.id }, { status: PaymentStatus.EXPIRED });
                    }
                });
                cancelledCount++;
                this.logger.warn(`Tự động hủy đơn hàng ${order.id}`);
            } catch (error) {
                this.logger.error(`Lỗi hủy đơn hàng ${order.id}: ${error.message}`);
            }
        }

        return cancelledCount;
    }
}
