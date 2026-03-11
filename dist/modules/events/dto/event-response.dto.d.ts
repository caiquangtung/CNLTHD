import { EventStatus } from '../entities/event.entity';
export declare class EventResponseDto {
    id: string;
    slug: string;
    name: string;
    description: string;
    location: string;
    startTime: Date;
    endTime: Date;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
}
