import { Expose } from 'class-transformer';

export class OrderItemResponseDto {
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
