import { IsArray, ValidateNested, ArrayMinSize, IsEnum, IsNotEmpty, ValidationOptions, registerDecorator } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/modules/payments/entities/payment.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
        description: 'Order items list',
        type: [CreateOrderItemDto],
        example: [
            {
                ticketTypeId: '550e8400-e29b-41d4-a716-446655440000',
                quantity: 2,
            },
        ],
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 vé' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];

    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethod,
        example: PaymentMethod.CREDIT_CARD,
    })
    @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
    @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
    paymentMethod: PaymentMethod;
}

