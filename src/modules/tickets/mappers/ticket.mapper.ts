import { plainToInstance } from 'class-transformer';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { Ticket } from '../entities';
import { TicketResponseDto } from '../dto/ticket-response.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';

export function mapCreateTicketDtoToEntity(dto: CreateTicketDto): Ticket {
  const ticket = new Ticket();
  ticket.orderId = dto.orderId;
  ticket.ticketTypeId = dto.ticketTypeId;
  ticket.ticketCode = dto.ticketCode;
  ticket.qrData = dto.qrData;
  if (dto.status !== undefined) {
    ticket.status = dto.status;
  }
  return ticket;
}

export function applyUpdateTicketDtoToEntity(
  ticket: Ticket,
  dto: UpdateTicketDto, 
): Ticket {
  if (dto.orderId !== undefined) {
    ticket.orderId = dto.orderId;
  }
  if (dto.ticketTypeId !== undefined) {
    ticket.ticketTypeId = dto.ticketTypeId;
  }
  if (dto.ticketCode !== undefined) {
    ticket.ticketCode = dto.ticketCode;
  }
  if (dto.qrData !== undefined) {
    ticket.qrData = dto.qrData;
  }
  if (dto.status !== undefined) {
    ticket.status = dto.status;
  }

  return ticket;  
}

export function mapTicketToResponseDto(ticket: Ticket): TicketResponseDto {
  return plainToInstance(TicketResponseDto, ticket, {
    excludeExtraneousValues: true,
  });
}

export function mapTicketsToResponseDto(
  tickets: Ticket[],
): TicketResponseDto[] {
  return plainToInstance(TicketResponseDto, tickets, {
    excludeExtraneousValues: true,
  });
}

