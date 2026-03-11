import { Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
export declare class TicketTypesService {
    private ticketTypesRepo;
    constructor(ticketTypesRepo: Repository<TicketType>);
    create(dto: CreateTicketTypeDto): Promise<TicketType>;
    findAll(): Promise<TicketType[]>;
    findByEvent(eventId: string): Promise<TicketType[]>;
    findById(id: string): Promise<TicketType>;
    update(id: string, dto: UpdateTicketTypeDto): Promise<TicketType>;
    softRemove(id: string): Promise<void>;
    restore(id: string): Promise<TicketType>;
    findAllWithDeleted(): Promise<TicketType[]>;
}
