import { BaseEntity } from '../../../common/entities';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';
import { User } from '../../users/entities/user.entity';
export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CANCELLED = "cancelled"
}
export declare class Event extends BaseEntity {
    slug: string;
    name: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    status: EventStatus;
    organizerId: string | null;
    organizer: User;
    ticketTypes: TicketType[];
}
