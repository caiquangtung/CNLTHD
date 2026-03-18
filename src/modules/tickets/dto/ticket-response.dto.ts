import { Expose } from 'class-transformer';
import { TicketStatus } from '../entities/ticket.entity';

@Expose()
export class TicketResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderId: string;

  @Expose()
  ticketTypeId: string;

  @Expose()
  ticketCode: string;

  @Expose()
  qrData: string;

  @Expose()
  status: TicketStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
