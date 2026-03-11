import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
export declare enum ReservationStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class OrderReservation extends BaseEntity {
    userId: string;
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    expiresAt: Date;
    status: ReservationStatus;
    user: User;
    ticketType: TicketType;
}
