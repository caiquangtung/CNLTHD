"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCreateEventDtoToEntity = mapCreateEventDtoToEntity;
exports.applyUpdateEventDtoToEntity = applyUpdateEventDtoToEntity;
exports.mapEventToResponseDto = mapEventToResponseDto;
exports.mapEventsToResponseDto = mapEventsToResponseDto;
const class_transformer_1 = require("class-transformer");
const event_entity_1 = require("../entities/event.entity");
const event_response_dto_1 = require("../dto/event-response.dto");
function mapCreateEventDtoToEntity(dto) {
    const event = new event_entity_1.Event();
    event.name = dto.name;
    event.slug = dto.slug;
    event.description = dto.description;
    event.location = dto.location;
    event.startTime = new Date(dto.startTime);
    event.endTime = new Date(dto.endTime);
    if (dto.status !== undefined) {
        event.status = dto.status;
    }
    return event;
}
function applyUpdateEventDtoToEntity(event, dto) {
    if (dto.name !== undefined)
        event.name = dto.name;
    if (dto.slug !== undefined)
        event.slug = dto.slug;
    if (dto.description !== undefined)
        event.description = dto.description;
    if (dto.location !== undefined)
        event.location = dto.location;
    if (dto.startTime !== undefined)
        event.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined)
        event.endTime = new Date(dto.endTime);
    if (dto.status !== undefined)
        event.status = dto.status;
    return event;
}
function mapEventToResponseDto(event) {
    return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventResponseDto, event, {
        excludeExtraneousValues: true,
    });
}
function mapEventsToResponseDto(events) {
    return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventResponseDto, events, {
        excludeExtraneousValues: true,
    });
}
//# sourceMappingURL=event.mapper.js.map