import { Expose } from 'class-transformer';

export class BookingItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderId: string;

  @Expose()
  ticketTypeId: string;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
