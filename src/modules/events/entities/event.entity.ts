import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event extends BaseEntity {
  @Index('idx_events_slug')
  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Index('idx_events_start_time')
  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Index('idx_events_status')
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  // Relationships
  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  ticketTypes: TicketType[];
}
