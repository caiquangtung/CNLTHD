import { plainToClass } from 'class-transformer';
import { Payment } from '../entities/payment.entity';
import { PaymentResponseDto } from '../dto/payment-response.dto';

export function mapPaymentToResponseDto(payment: Payment): PaymentResponseDto {
    return plainToClass(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
    });
}

export function mapPaymentsToResponseDto(payments: Payment[]): PaymentResponseDto[] {
    return payments.map((payment) =>
        mapPaymentToResponseDto(payment),
    );
}
