/**
 * DTO cập nhật event (partial của CreateEventDto).
 * Tương ứng: ticket-types/dto/update-ticket-type.dto.ts
 */
import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
