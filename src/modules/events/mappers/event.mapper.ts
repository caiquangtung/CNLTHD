import { plainToInstance } from 'class-transformer';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventResponseDto } from '../dto/event-response.dto';

export function mapCreateEventDtoToEntity(
  dto: CreateEventDto,
  organizerId: string,
): Event {
  const event = new Event();
  event.name = dto.name;
  event.slug = dto.slug;
  event.description = dto.description;
  event.location = dto.location;
  event.startTime = new Date(dto.startTime);
  event.endTime = new Date(dto.endTime);
  event.organizerId = organizerId;
  if (dto.status !== undefined) {
    event.status = dto.status;
  }
  return event;
}

export function applyUpdateEventDtoToEntity(
  event: Event,
  dto: UpdateEventDto,
): Event {
  if (dto.name !== undefined) event.name = dto.name;
  if (dto.slug !== undefined) event.slug = dto.slug;
  if (dto.description !== undefined) event.description = dto.description;
  if (dto.location !== undefined) event.location = dto.location;
  if (dto.startTime !== undefined) event.startTime = new Date(dto.startTime);
  if (dto.endTime !== undefined) event.endTime = new Date(dto.endTime);
  if (dto.status !== undefined) event.status = dto.status;
  return event;
}

export function mapEventToResponseDto(event: Event): EventResponseDto {
  return plainToInstance(EventResponseDto, event, {
    excludeExtraneousValues: true,
  });
}

export function mapEventsToResponseDto(events: Event[]): EventResponseDto[] {
  return plainToInstance(EventResponseDto, events, {
    excludeExtraneousValues: true,
  });
}
