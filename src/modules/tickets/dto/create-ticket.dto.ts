import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TicketStatus } from '../entities';

export class CreateTicketDto {
  @IsUUID('loose')
  orderId: string;

  @IsUUID('loose')
  ticketTypeId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ticketCode: string;

  @IsString()
  @MinLength(1)
  qrData: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
