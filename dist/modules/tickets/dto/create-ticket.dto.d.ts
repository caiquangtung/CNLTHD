import { TicketStatus } from '../entities';
export declare class CreateTicketDto {
    orderId: string;
    ticketTypeId: string;
    ticketCode: string;
    qrData: string;
    status?: TicketStatus;
}
