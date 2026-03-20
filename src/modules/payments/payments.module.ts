import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { VnpayGateway, PaymentGatewayFactory } from './gateways';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment]),
        forwardRef(() => OrdersModule),
    ],
    providers: [
        PaymentsService,
        // Payment gateways
        VnpayGateway,
        PaymentGatewayFactory,
    ],
    controllers: [PaymentsController],
    exports: [PaymentsService, PaymentGatewayFactory],
})
export class PaymentsModule { }
