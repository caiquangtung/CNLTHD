import { BaseEntity } from '../../../common/entities';
import { Event } from '../../events/entities/event.entity';
import { OrderReservation } from '../../bookings/entities/order-reservation.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
export declare class TicketType extends BaseEntity {
    eventId: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    maxPerOrder: number;
    event: Event;
    reservations: OrderReservation[];
    orderItems: OrderItem[];
    tickets: Ticket[];
}
