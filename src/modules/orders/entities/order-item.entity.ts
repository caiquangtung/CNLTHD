import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Order } from './order.entity';
import { TicketType } from '../../ticket-types/entities/ticket-type.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'ticket_type_id' })
  ticketTypeId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  // Relationships
  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.orderItems)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
