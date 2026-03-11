import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeResponseDto } from './dto/ticket-type-response.dto';
export declare class TicketTypesController {
    private readonly ticketTypesService;
    constructor(ticketTypesService: TicketTypesService);
    create(createTicketTypeDto: CreateTicketTypeDto): Promise<TicketTypeResponseDto>;
    findAll(): Promise<TicketTypeResponseDto[]>;
    findAllWithDeleted(): Promise<TicketTypeResponseDto[]>;
    findByEvent(eventId: string): Promise<TicketTypeResponseDto[]>;
    findOne(id: string): Promise<TicketTypeResponseDto>;
    update(id: string, updateTicketTypeDto: UpdateTicketTypeDto): Promise<TicketTypeResponseDto>;
    restore(id: string): Promise<TicketTypeResponseDto>;
    remove(id: string): Promise<void>;
}
