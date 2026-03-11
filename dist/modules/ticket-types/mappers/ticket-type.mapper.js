"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCreateTicketTypeDtoToEntity = mapCreateTicketTypeDtoToEntity;
exports.applyUpdateTicketTypeDtoToEntity = applyUpdateTicketTypeDtoToEntity;
exports.mapTicketTypeToResponseDto = mapTicketTypeToResponseDto;
exports.mapTicketTypesToResponseDto = mapTicketTypesToResponseDto;
const class_transformer_1 = require("class-transformer");
const ticket_type_entity_1 = require("../entities/ticket-type.entity");
const ticket_type_response_dto_1 = require("../dto/ticket-type-response.dto");
function mapCreateTicketTypeDtoToEntity(dto) {
    const ticketType = new ticket_type_entity_1.TicketType();
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
function applyUpdateTicketTypeDtoToEntity(ticketType, dto) {
    if (dto.eventId !== undefined)
        ticketType.eventId = dto.eventId;
    if (dto.name !== undefined)
        ticketType.name = dto.name;
    if (dto.description !== undefined)
        ticketType.description = dto.description;
    if (dto.price !== undefined)
        ticketType.price = dto.price;
    if (dto.quantity !== undefined)
        ticketType.quantity = dto.quantity;
    if (dto.maxPerOrder !== undefined)
        ticketType.maxPerOrder = dto.maxPerOrder;
    return ticketType;
}
function mapTicketTypeToResponseDto(ticketType) {
    return (0, class_transformer_1.plainToInstance)(ticket_type_response_dto_1.TicketTypeResponseDto, ticketType, {
        excludeExtraneousValues: true,
    });
}
function mapTicketTypesToResponseDto(ticketTypes) {
    return (0, class_transformer_1.plainToInstance)(ticket_type_response_dto_1.TicketTypeResponseDto, ticketTypes, {
        excludeExtraneousValues: true,
    });
}
//# sourceMappingURL=ticket-type.mapper.js.map