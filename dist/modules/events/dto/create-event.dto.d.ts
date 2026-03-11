import { EventStatus } from '../entities/event.entity';
export declare class CreateEventDto {
    name: string;
    slug: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    status?: EventStatus;
}
