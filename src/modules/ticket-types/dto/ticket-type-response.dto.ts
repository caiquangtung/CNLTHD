import { Exclude, Expose } from 'class-transformer';

export class TicketTypeResponseDto {
  @Expose()
  id: string;

  @Expose()
  eventId: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  maxPerOrder: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
