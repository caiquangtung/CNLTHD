import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepo: Repository<Payment>,
        private ordersService: OrdersService,
    ) { }

    /**
     * Hoàn thành thanh toán và update order status
     */
    async completePayment(paymentId: string, dto: CompletePaymentDto): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({
            where: { id: paymentId },
            relations: ['order'],
        });

        if (!payment) {
            throw new NotFoundException(`Không tìm thấy hóa đơn id: ${paymentId}`);
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
        if (payment.order) {
            payment.order.status = OrderStatus.PAID;
        }
        await this.paymentsRepo.save(payment);

        return payment;
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

    /**
     * Refund payment
     */
    async refundPayment(paymentId: string): Promise<Payment> {
        const payment = await this.findById(paymentId);

        if (payment.status === PaymentStatus.REFUNDED) {
            throw new BadRequestException('Payment is already refunded');
        }

        if (payment.status !== PaymentStatus.SUCCESS) {
            throw new BadRequestException(
                'Only success payments can be refunded',
            );
        }

        payment.status = PaymentStatus.REFUNDED;
        if (payment.order) {
            payment.order.status = OrderStatus.CANCELLED;
        }
        await this.paymentsRepo.save(payment);

        return payment;
    }
}
