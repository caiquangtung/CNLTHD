import { Order } from '../../orders/entities/order.entity';

// Booking details hiện map trực tiếp từ `Order` (đã load relations orderItems + payment)
export type OrderDetailResponse = Order;

