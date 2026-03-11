import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    create(createTicketDto: CreateTicketDto): Promise<TicketResponseDto>;
    findAll(): Promise<TicketResponseDto[]>;
    findAllWithDeleted(): Promise<TicketResponseDto[]>;
    findMyTickets(user: {
        id: string;
    }): Promise<TicketResponseDto[]>;
    findByOrder(orderId: string): Promise<TicketResponseDto[]>;
    findByCode(ticketCode: string): Promise<TicketResponseDto>;
    getTicketQR(id: string): Promise<string>;
    findOne(id: string): Promise<TicketResponseDto>;
    update(id: string, updateTicketDto: UpdateTicketDto): Promise<TicketResponseDto>;
    markAsUsed(id: string): Promise<TicketResponseDto>;
    markAsCancelled(id: string): Promise<TicketResponseDto>;
    restore(id: string): Promise<TicketResponseDto>;
    remove(id: string): Promise<void>;
}
