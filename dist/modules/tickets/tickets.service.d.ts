import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
export declare class TicketsService {
    private readonly ticketsRepo;
    constructor(ticketsRepo: Repository<Ticket>);
    create(dto: CreateTicketDto): Promise<Ticket>;
    findAll(): Promise<Ticket[]>;
    findAllWithDeleted(): Promise<Ticket[]>;
    findByOrder(orderId: string): Promise<Ticket[]>;
    findByUser(userId: string): Promise<Ticket[]>;
    findById(id: string): Promise<Ticket>;
    findByCode(ticketCode: string): Promise<Ticket>;
    generateQrBase64(id: string): Promise<string>;
    update(id: string, dto: UpdateTicketDto): Promise<Ticket>;
    softRemove(id: string): Promise<void>;
    markAsUsed(id: string): Promise<Ticket>;
    markAsCancelled(id: string): Promise<Ticket>;
    restore(id: string): Promise<Ticket>;
}
