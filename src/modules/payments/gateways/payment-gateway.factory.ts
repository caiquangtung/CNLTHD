import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PaymentMethod } from '../entities/payment.entity';
import { IPaymentGateway } from './payment-gateway.interface';
import { VnpayGateway } from './vnpay.gateway';
import { MomoGateway } from './momo.gateway';

@Injectable()
export class PaymentGatewayFactory {
    private readonly logger = new Logger(PaymentGatewayFactory.name);

    constructor(
        private readonly vnpayGateway: VnpayGateway,
        private readonly momoGateway: MomoGateway,
    ) { }

    /**
     * Get payment gateway by payment method
     */
    getGateway(method: PaymentMethod): IPaymentGateway {
        switch (method) {
            case PaymentMethod.BANK_TRANSFER:
                this.logger.debug('Using VNPay gateway for BANK_TRANSFER');
                return this.vnpayGateway;

            case PaymentMethod.E_WALLET:
                this.logger.debug('Using Momo gateway for E_WALLET');
                return this.momoGateway;

            default:
                throw new BadRequestException(`Unsupported payment method: ${method}`);
        }
    }
}
