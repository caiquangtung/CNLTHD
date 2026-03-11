import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private eventsRepo;
    constructor(eventsRepo: Repository<Event>);
    create(dto: CreateEventDto): Promise<Event>;
    findAll(): Promise<Event[]>;
    findById(id: string): Promise<Event>;
    findBySlug(slug: string): Promise<Event>;
    update(id: string, dto: UpdateEventDto): Promise<Event>;
    softRemove(id: string): Promise<void>;
    restore(id: string): Promise<Event>;
    findAllWithDeleted(): Promise<Event[]>;
}
