import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    PAID = "paid",
    CANCELLED = "cancelled"
}
export declare class Order extends BaseEntity {
    userId: string;
    totalAmount: number;
    status: OrderStatus;
    user: User;
    orderItems: OrderItem[];
    payment: Payment;
    tickets: Ticket[];
}
