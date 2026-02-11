import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('order_reservations')
@Index('idx_reservations_user_ticket', ['userId', 'ticketTypeId'])
@Index('idx_reservations_status_expires', ['status', 'expiresAt'])
export class OrderReservation extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.reservations)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
