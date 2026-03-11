import { BaseEntity } from '../../../common/entities';
import { Order } from '../../orders/entities/order.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
export declare enum TicketStatus {
    ACTIVE = "active",
    USED = "used",
    CANCELLED = "cancelled"
}
export declare class Ticket extends BaseEntity {
    orderId: string;
    ticketTypeId: string;
    ticketCode: string;
    qrData: string;
    status: TicketStatus;
    order: Order;
    ticketType: TicketType;
}
