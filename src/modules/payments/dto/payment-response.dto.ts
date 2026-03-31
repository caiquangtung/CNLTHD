import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { Exclude, Expose } from 'class-transformer';

export class PaymentResponseDto {
    @Expose()
    id: string;

    @Expose()
    orderId: string;

    @Expose()
    amount: number;

    @Expose()
    paymentMethod: PaymentMethod;

    @Expose()
    status: PaymentStatus;

    @Expose()
    transactionId?: string;

    @Expose()
    paymentTime?: Date;

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
}
