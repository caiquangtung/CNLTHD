/**
 * DTO trả về event cho client (chỉ expose các field cần thiết).
 * Tương ứng: ticket-types/dto/ticket-type-response.dto.ts
 */
import { Expose } from 'class-transformer';
import { EventStatus } from '../entities/event.entity';

export class EventResponseDto {
  @Expose()
  id: string;

  @Expose()
  slug: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  location: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  status: EventStatus;

  @Expose()
  organizerId: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
