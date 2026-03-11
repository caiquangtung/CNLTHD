import { TicketType } from '../entities/ticket-type.entity';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';
export declare function mapCreateTicketTypeDtoToEntity(dto: CreateTicketTypeDto): TicketType;
export declare function applyUpdateTicketTypeDtoToEntity(ticketType: TicketType, dto: UpdateTicketTypeDto): TicketType;
export declare function mapTicketTypeToResponseDto(ticketType: TicketType): TicketTypeResponseDto;
export declare function mapTicketTypesToResponseDto(ticketTypes: TicketType[]): TicketTypeResponseDto[];
