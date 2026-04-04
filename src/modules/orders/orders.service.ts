import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, EntityManager, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
    mapCreateOrderDtoToEntity,
} from './mappers/order.mapper';
import { TicketType } from '../ticket-types/entities';
import { Payment, PaymentStatus } from '../payments/entities';
import { Ticket } from '../tickets/entities/ticket.entity';
import { PaginatedResponse } from 'src/common';

const MAX_PENDING_ORDERS = 2;

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    private readonly paymentDeadlineMinutes: number;

    constructor(
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
        @InjectDataSource() private dataSource: DataSource,
        private configService: ConfigService,
    ) {
        this.paymentDeadlineMinutes = this.configService.get<number>('payment.timeout') || 5;
    }

    async create(dto: CreateOrderDto, userId: string): Promise<Order> {
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

            const uniqueTicketTypeIds = new Set(order.orderItems.map((item) => item.ticketTypeId));
            if (uniqueTicketTypeIds.size !== order.orderItems.length) {
                throw new BadRequestException('Không được chọn trùng loại vé trong cùng một đơn hàng');
            }

            let totalAmount = 0;

            for (const item of order.orderItems) {
                const ticketType = await manager.findOne(TicketType, {
                    where: { id: item.ticketTypeId },
                });

                if (!ticketType) throw new NotFoundException(`Loại vé không tồn tại`);

                if (item.quantity > ticketType.maxPerOrder) {
                    throw new BadRequestException(`Vé ${ticketType.name} chỉ được mua tối đa ${ticketType.maxPerOrder} vé mỗi đơn hàng`);
                }

                const decrementResult = await manager.decrement(
                    TicketType,
                    {
                        id: item.ticketTypeId,
                        quantity: MoreThanOrEqual(item.quantity),
                    },
                    'quantity',
                    item.quantity,
                );

                if (!decrementResult.affected) {
                    throw new BadRequestException(`Vé ${ticketType.name} không đủ số lượng`);
                }

                item.unitPrice = ticketType.price;
                totalAmount += Number(ticketType.price) * item.quantity;
            }

            order.totalAmount = totalAmount;

            // Xử lý đặc biệt cho phương thức CASH
            if (dto.paymentMethod === 'cash') {
                order.status = OrderStatus.PAID;
                order.paymentDeadline = new Date(Date.now() + this.paymentDeadlineMinutes * 60 * 1000);;
                order.payment = manager.create(Payment, {
                    amount: totalAmount,
                    status: PaymentStatus.SUCCESS,
                    paymentMethod: dto.paymentMethod,
                    transactionId: 'CASH-MOCK',
                });
            } else if (dto.paymentMethod === 'bank_transfer') {
                order.status = OrderStatus.PENDING;
                order.paymentDeadline = new Date(Date.now() + this.paymentDeadlineMinutes * 60 * 1000);
                order.payment = manager.create(Payment, {
                    amount: totalAmount,
                    status: PaymentStatus.PENDING,
                    paymentMethod: dto.paymentMethod,
                    transactionId: "BANK-TRANSFER-MOCK",
                });
            }

            const savedOrder = await manager.save(order); // Lưu toàn bộ Order + Items + Payment
            return savedOrder;
        });
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepo.find({ relations: ['orderItems'], order: { createdAt: 'DESC' } });
    }

    async findAllPaged(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
        const skip = (page - 1) * limit;
        const [orders, total] = await this.ordersRepo.findAndCount({
            relations: ['orderItems'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return { items: orders, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findByUserId(userId: string): Promise<Order[]> {
        return this.ordersRepo.find({
            where: {
                userId: userId
            },
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
     * Tự động cancel các order PENDING quá hạn thanh toán 
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
                this.logger.error(`Lỗi hủy đơn hàng ${order.id}`);
            }
        }

        return cancelledCount;
    }
}
