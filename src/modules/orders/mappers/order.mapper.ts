import { plainToInstance } from 'class-transformer';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto, CreateOrderItemDto } from '../dto';
import { OrderResponseDto } from '../dto/order-response.dto';

export function mapOrderToResponseDto(order: Order): OrderResponseDto {
  return plainToInstance(OrderResponseDto, order, {
    excludeExtraneousValues: true,
  });
}

export function mapOrdersToResponseDto(orders: Order[]): OrderResponseDto[] {
  return plainToInstance(OrderResponseDto, orders, {
    excludeExtraneousValues: true,
  });
}

export function mapCreateOrderDtoToEntity(dto: CreateOrderDto): Order {
  const order = new Order();
  order.orderItems = dto.orderItems
    .map(mapCreateOrderItemDtoToEntity)
    .sort((a, b) => a.ticketTypeId.localeCompare(b.ticketTypeId));
  return order;
}

export function mapCreateOrderItemDtoToEntity(
  dto: CreateOrderItemDto,
): OrderItem {
  const orderItem = new OrderItem();
  orderItem.ticketTypeId = dto.ticketTypeId;
  orderItem.quantity = dto.quantity;
  return orderItem;
}
