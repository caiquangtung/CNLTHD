import { Expose } from 'class-transformer';
import { OrderStatus } from '../../orders/entities/order.entity';

export class BookingStatusStatDto {
  @Expose()
  status: OrderStatus;

  @Expose()
  count: number;

  @Expose()
  totalAmount: number;
}

export class BookingStatsResponseDto {
  @Expose()
  totalOrders: number;

  @Expose()
  totalRevenue: number;

  @Expose()
  paidOrders: number;

  @Expose()
  paidRevenue: number;

  @Expose()
  statusStats: BookingStatusStatDto[];
}

