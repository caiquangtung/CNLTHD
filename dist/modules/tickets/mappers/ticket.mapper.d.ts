import { CreateTicketDto } from '../dto/create-ticket.dto';
import { Ticket } from '../entities';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
export declare function mapCreateTicketDtoToEntity(dto: CreateTicketDto): Ticket;
export declare function applyUpdateTicketDtoToEntity(ticket: Ticket, dto: UpdateTicketDto): Ticket;
export declare function mapTicketToResponseDto(ticket: Ticket): TicketResponseDto;
export declare function mapTicketsToResponseDto(tickets: Ticket[]): TicketResponseDto[];
