import { TicketStatus } from '../entities/ticket.entity';
export declare class TicketResponseDto {
    id: string;
    orderId: string;
    ticketTypeId: string;
    ticketCode: string;
    qrData: string;
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
}
