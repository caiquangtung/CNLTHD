import { IsArray, ValidateNested, ArrayMinSize, IsEnum, IsNotEmpty, ValidationOptions, registerDecorator } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/modules/payments/entities/payment.entity';

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 vé' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    orderItems: CreateOrderItemDto[];

    @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống' })
    @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ' })
    paymentMethod: PaymentMethod;
}

