import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';
import { OrderItemResponseDto } from './order-item-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
    @Expose()
    id: string;

    @Expose()
    userId: string;

    @Expose()
    totalAmount: number;

    @Expose()
    status: OrderStatus;

    @Expose()
    @Type(() => OrderItemResponseDto)
    orderItems: OrderItemResponseDto[];

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;

    @Exclude()
    paymentDeadline: Date;

    @ApiProperty({
        description: 'Link thanh toán từ cổng (VNPay/Momo)',
        example: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...'
    })
    paymentUrl: string;
}

