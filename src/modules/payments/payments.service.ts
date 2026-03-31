import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepo: Repository<Payment>,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => OrdersService))
        private ordersService: OrdersService,
    ) { }

    /**
     * Hoàn thành thanh toán và update order status (sử dụng transaction)
     */
    async completePayment(
        paymentId: string,
        dto: CompletePaymentDto,
        userId: string,
    ): Promise<Payment> {
        return await this.dataSource.transaction(async (manager) => {
            // Lock payment ONLY (without joins) to avoid "FOR UPDATE cannot be applied to nullable side of outer join"
            const payment = await manager
                .createQueryBuilder(Payment, 'payment')
                .setLock('pessimistic_write')
                .where('payment.id = :id', { id: paymentId })
                .getOne();

            if (!payment) {
                throw new NotFoundException(`Không tìm thấy hóa đơn id: ${paymentId}`);
            }

            // Load related order separately (no lock needed)
            if (payment.orderId) {
                payment.order = await manager.findOne(Order, {
                    where: { id: payment.orderId },
                });
            }

            if (!payment.order) {
                throw new NotFoundException(`Không tìm thấy đơn hàng cho hóa đơn id: ${paymentId}`);
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException(
                    `Hóa đơn đã được ${payment.status}, không thể hoàn thành`,
                );
            }

            // Kiểm tra order đã bị cancel chưa (timeout hoặc user cancel)
            if (payment.order && payment.order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Order đã bị ${payment.order.status}, không thể thanh toán`,
                );
            }

            // Update payment status
            payment.status = PaymentStatus.SUCCESS;
            payment.transactionId = dto.transactionId;
            payment.paymentTime = new Date();
            await manager.save(payment);

            // Update order status (never use cascade for manual update)
            payment.order.status = OrderStatus.PAID;
            await manager.save(payment.order);

            return payment;
        });
    }

    /**
     * Lấy payment theo ID
     */
    async findById(id: string): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({
            where: { id },
            relations: ['order'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with id "${id}" not found`);
        }

        return payment;
    }

    /**
     * Lấy payment theo Order ID
     */
    async findByOrderId(orderId: string): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({
            where: { orderId },
            relations: ['order'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment for order "${orderId}" not found`);
        }

        return payment;
    }
}
