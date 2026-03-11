import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventResponseDto } from '../dto/event-response.dto';
export declare function mapCreateEventDtoToEntity(dto: CreateEventDto): Event;
export declare function applyUpdateEventDtoToEntity(event: Event, dto: UpdateEventDto): Event;
export declare function mapEventToResponseDto(event: Event): EventResponseDto;
export declare function mapEventsToResponseDto(events: Event[]): EventResponseDto[];
