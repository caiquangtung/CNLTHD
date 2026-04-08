import { plainToInstance } from 'class-transformer';
import { Order } from '../../orders/entities/order.entity';
import { OrderResponseDto } from '../../orders/dto/order-response.dto';

export function mapBookingToResponseDto(order: Order): OrderResponseDto {
  return plainToInstance(OrderResponseDto, order, {
    excludeExtraneousValues: true,
  });
}

export function mapBookingsToResponseDto(orders: Order[]): OrderResponseDto[] {
  return plainToInstance(OrderResponseDto, orders, {
    excludeExtraneousValues: true,
  });
}
