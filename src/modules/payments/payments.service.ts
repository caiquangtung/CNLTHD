import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Payment)
        private paymentsRepo: Repository<Payment>,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => OrdersService))
        private ordersService: OrdersService,
        private gatewayFactory: PaymentGatewayFactory,
    ) { }

    /**
     * Build payment URL theo payment method
     */
    async buildPaymentUrl(
        method: PaymentMethod,
        orderId: string,
        amount: number,
        orderInfo: string,
        ipAddr: string,
    ): Promise<string> {
        this.logger.log(`Building payment URL for ${method} - Order: ${orderId}`);
        const gateway = this.gatewayFactory.getGateway(method);
        return gateway.buildPaymentUrl(orderId, amount, orderInfo, ipAddr);
    }

    /**
     * Verify callback từ payment gateway
     */
    verifyPaymentCallback(method: PaymentMethod, query: Record<string, string>) {
        this.logger.log(`Verifying ${method} callback`);
        const gateway = this.gatewayFactory.getGateway(method);
        return gateway.verifyCallback(query);
    }

    /**
     * Hoàn thành thanh toán và update order status (sử dụng transaction)
     */
    async completePayment(paymentId: string, dto: CompletePaymentDto): Promise<Payment> {
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
            if (payment.order) {
                payment.order.status = OrderStatus.PAID;
                await manager.save(payment.order);
            }

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

    /**
     * Refund payment (sử dụng transaction)
     */
    async refundPayment(paymentId: string): Promise<Payment> {
        return await this.dataSource.transaction(async (manager) => {
            // Lock payment ONLY (without joins) to avoid "FOR UPDATE cannot be applied to nullable side of outer join"
            const payment = await manager
                .createQueryBuilder(Payment, 'payment')
                .setLock('pessimistic_write')
                .where('payment.id = :id', { id: paymentId })
                .getOne();

            if (!payment) {
                throw new NotFoundException(`Payment with id "${paymentId}" not found`);
            }

            // Load related order separately (no lock needed)
            if (payment.orderId) {
                payment.order = await manager.findOne(Order, {
                    where: { id: payment.orderId },
                });
            }

            if (payment.status === PaymentStatus.REFUNDED) {
                throw new BadRequestException('Payment is already refunded');
            }

            if (payment.status !== PaymentStatus.SUCCESS) {
                throw new BadRequestException(
                    'Only success payments can be refunded',
                );
            }

            // Update payment status
            payment.status = PaymentStatus.REFUNDED;
            await manager.save(payment);

            // Update order status
            if (payment.order) {
                payment.order.status = OrderStatus.CANCELLED;
                await manager.save(payment.order);
            }

            return payment;
        });
    }
}
