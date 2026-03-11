import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { TicketTypesService } from '../ticket-types/ticket-types.service';
import { CreateTicketTypeDto } from '../ticket-types/dto/create-ticket-type.dto';
import { TicketTypeResponseDto } from '../ticket-types/dto/ticket-type-response.dto';
export declare class EventsController {
    private readonly eventsService;
    private readonly ticketTypesService;
    constructor(eventsService: EventsService, ticketTypesService: TicketTypesService);
    create(createEventDto: CreateEventDto): Promise<EventResponseDto>;
    findAll(): Promise<EventResponseDto[]>;
    findAllWithDeleted(): Promise<EventResponseDto[]>;
    findOne(id: string): Promise<EventResponseDto>;
    findTicketsByEvent(id: string): Promise<TicketTypeResponseDto[]>;
    createTicketTypeForEvent(id: string, createTicketTypeDto: CreateTicketTypeDto): Promise<TicketTypeResponseDto>;
    update(id: string, updateEventDto: UpdateEventDto): Promise<EventResponseDto>;
    restore(id: string): Promise<EventResponseDto>;
    remove(id: string): Promise<void>;
}
