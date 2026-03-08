import { plainToInstance } from 'class-transformer';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { CreateOrderDto, CreateOrderItemDto } from '../dto';

export function applyUpdateOrderDtoToEntity(
    order: Order,
    dto: UpdateOrderDto,
): Order {
    // if (dto.status !== undefined) order.status = dto.status;
    // return order;
    return null;
}

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
    order.orderItems = dto.orderItems.map(mapCreateOrderItemDtoToEntity).sort((a, b) => a.ticketTypeId.localeCompare(b.ticketTypeId));
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

export function applyUpdateOrderItemDtoToEntity(
    orderItem: OrderItem,
    dto: any,
): OrderItem {
    if (dto.ticketTypeId !== undefined) orderItem.ticketTypeId = dto.ticketTypeId;
    if (dto.quantity !== undefined) orderItem.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) orderItem.unitPrice = Number(dto.unitPrice);
    return orderItem;
}
