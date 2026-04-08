import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../../orders/entities/order.entity';
import { BookingItemResponseDto } from './booking-item-response.dto';

export class BookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  totalAmount: number;

  @Expose()
  status: OrderStatus;

  @Expose()
  @Type(() => BookingItemResponseDto)
  orderItems: BookingItemResponseDto[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  paymentDeadline: Date;
}