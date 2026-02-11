import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Event } from '../../events/entities/event.entity';
import { OrderReservation } from '../../bookings/entities/order-reservation.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
@Entity('ticket_types')
export class TicketType extends BaseEntity {
  @Index('idx_ticket_types_event_id')
  @Column({ name: 'event_id' })
  eventId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'max_per_order', type: 'int', default: 10 })
  maxPerOrder: number;

  // Relationships
  @ManyToOne(() => Event, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => OrderReservation, (reservation) => reservation.ticketType)
  reservations: OrderReservation[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.ticketType)
  orderItems: OrderItem[];

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  tickets: Ticket[];
}
