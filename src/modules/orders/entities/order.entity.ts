import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Index('idx_orders_user_id')
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Index('idx_orders_status')
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_deadline',
    type: 'timestamp',
    nullable: false
  })
  paymentDeadline: Date;

  @Column({
    name: 'cancel_reason',
    type: 'varchar',
    nullable: true
  })
  cancelReason?: string;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert']
  })
  orderItems: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, {
    cascade: ['insert'], // Tự động lưu Payment khi lưu Order
  })
  payment: Payment;

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}
