import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class PaymentResponseDto {
    @ApiProperty({
        description: 'Payment ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id: string;

    @ApiProperty({
        description: 'Order ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })
    orderId: string;

    @ApiProperty({
        description: 'Payment amount',
        example: 275.50,
    })
    amount: number;

    @ApiProperty({
        description: 'Payment method',
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'cash'],
        example: 'credit_card',
    })
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Payment status',
        enum: ['pending', 'success', 'failed', 'refunded'],
        example: 'pending',
    })
    status: PaymentStatus;

    @ApiProperty({
        description: 'Transaction ID',
        example: 'TXN123456',
        nullable: true,
    })
    transactionId?: string;

    @ApiProperty({
        description: 'Payment time',
        example: '2024-01-15T10:30:00.000Z',
        nullable: true,
    })
    paymentTime?: Date;

    @ApiProperty({
        description: 'Created at',
        example: '2024-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Updated at',
        example: '2024-01-15T10:30:00.000Z',
    })
    updatedAt: Date;
}
