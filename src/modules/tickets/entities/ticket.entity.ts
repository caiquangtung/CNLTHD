import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Order } from '../../orders/entities/order.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';

export enum TicketStatus {
  ACTIVE = 'active',
  USED = 'used',
  CANCELLED = 'cancelled',
}

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Index('idx_tickets_order_id')
  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string;

  @Index('idx_tickets_code')
  @Column({ name: 'ticket_code', unique: true })
  ticketCode: string;

  @Column({ name: 'qr_data', type: 'text' })
  qrData: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.ACTIVE,
  })
  status: TicketStatus;

  // Relationships
  @ManyToOne(() => Order, (order) => order.tickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
