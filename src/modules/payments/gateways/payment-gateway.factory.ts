import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentMethod } from '../entities/payment.entity';
import { IPaymentGateway } from './payment-gateway.interface';
import { VnpayGateway } from './vnpay.gateway';

@Injectable()
export class PaymentGatewayFactory {
    private readonly logger = new Logger(PaymentGatewayFactory.name);

    constructor(
        private readonly vnpayGateway: VnpayGateway,
    ) { }

    /**
     * Get payment gateway by payment method
     */
    getGateway(method: PaymentMethod): IPaymentGateway {
        switch (method) {
            case PaymentMethod.BANK_TRANSFER:
                this.logger.debug('Using VNPay gateway for BANK_TRANSFER');
                return this.vnpayGateway;

            default:
                throw new BadRequestException(`Unsupported payment method: ${method}`);
        }
    }
}
