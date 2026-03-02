import { plainToInstance } from 'class-transformer';
import { TicketType } from '../entities/ticket-type.entity';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';

export function mapCreateTicketTypeDtoToEntity(
  dto: CreateTicketTypeDto,
): TicketType {
  const ticketType = new TicketType();
  ticketType.eventId = dto.eventId;
  ticketType.name = dto.name;
  ticketType.description = dto.description;
  ticketType.price = dto.price;
  ticketType.quantity = dto.quantity;
  if (dto.maxPerOrder !== undefined) {
    ticketType.maxPerOrder = dto.maxPerOrder;
  }
  return ticketType;
}

export function applyUpdateTicketTypeDtoToEntity(
  ticketType: TicketType,
  dto: UpdateTicketTypeDto,
): TicketType {
  if (dto.eventId !== undefined) ticketType.eventId = dto.eventId;
  if (dto.name !== undefined) ticketType.name = dto.name;
  if (dto.description !== undefined) ticketType.description = dto.description;
  if (dto.price !== undefined) ticketType.price = dto.price;
  if (dto.quantity !== undefined) ticketType.quantity = dto.quantity;
  if (dto.maxPerOrder !== undefined) ticketType.maxPerOrder = dto.maxPerOrder;
  return ticketType;
}

export function mapTicketTypeToResponseDto(
  ticketType: TicketType,
): TicketTypeResponseDto {
  return plainToInstance(TicketTypeResponseDto, ticketType, {
    excludeExtraneousValues: true,
  });
}

export function mapTicketTypesToResponseDto(
  ticketTypes: TicketType[],
): TicketTypeResponseDto[] {
  return plainToInstance(TicketTypeResponseDto, ticketTypes, {
    excludeExtraneousValues: true,
  });
}
