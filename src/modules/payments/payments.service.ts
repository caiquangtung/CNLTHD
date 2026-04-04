import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepo: Repository<Payment>,
        @InjectDataSource() private dataSource: DataSource,
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
            const payment = await manager.findOne(Payment, {
                where: { id: paymentId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!payment) {
                throw new NotFoundException(`Không tìm thấy hóa đơn id: ${paymentId}`);
            }

            const order = await manager.findOne(Order, {
                where: { id: payment.orderId },
            });

            if (!order) {
                throw new NotFoundException(`Không tìm thấy đơn hàng cho hóa đơn id: ${paymentId}`);
            }

            if (order.userId !== userId) {
                throw new ForbiddenException('Bạn không có quyền hoàn thành thanh toán của đơn hàng này');
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new BadRequestException(
                    `Hóa đơn đã được ${payment.status}, không thể hoàn thành`,
                );
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Order đã bị ${order.status}, không thể thanh toán`,
                );
            }

            payment.status = PaymentStatus.SUCCESS;
            payment.transactionId = dto.transactionId;
            payment.paymentTime = new Date();

            order.status = OrderStatus.PAID;

            await manager.save([payment, order]);

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
