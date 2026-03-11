"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCreateTicketDtoToEntity = mapCreateTicketDtoToEntity;
exports.applyUpdateTicketDtoToEntity = applyUpdateTicketDtoToEntity;
exports.mapTicketToResponseDto = mapTicketToResponseDto;
exports.mapTicketsToResponseDto = mapTicketsToResponseDto;
const class_transformer_1 = require("class-transformer");
const entities_1 = require("../entities");
const ticket_response_dto_1 = require("../dto/ticket-response.dto");
function mapCreateTicketDtoToEntity(dto) {
    const ticket = new entities_1.Ticket();
    ticket.orderId = dto.orderId;
    ticket.ticketTypeId = dto.ticketTypeId;
    ticket.ticketCode = dto.ticketCode;
    ticket.qrData = dto.qrData;
    if (dto.status !== undefined) {
        ticket.status = dto.status;
    }
    return ticket;
}
function applyUpdateTicketDtoToEntity(ticket, dto) {
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
function mapTicketToResponseDto(ticket) {
    return (0, class_transformer_1.plainToInstance)(ticket_response_dto_1.TicketResponseDto, ticket, {
        excludeExtraneousValues: true,
    });
}
function mapTicketsToResponseDto(tickets) {
    return (0, class_transformer_1.plainToInstance)(ticket_response_dto_1.TicketResponseDto, tickets, {
        excludeExtraneousValues: true,
    });
}
//# sourceMappingURL=ticket.mapper.js.map