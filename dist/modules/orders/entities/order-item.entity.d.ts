import { BaseEntity } from '../../../common/entities';
import { Order } from './order.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
export declare class OrderItem extends BaseEntity {
    orderId: string;
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    order: Order;
    ticketType: TicketType;
}
