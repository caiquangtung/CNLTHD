import { Entity, Column, Index, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Index('idx_payments_order_id')
  @Column({ name: 'order_id', unique: true })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Index('idx_payments_transaction_id')
  @Column({ name: 'transaction_id', unique: true })
  transactionId: string;

  @Column({ name: 'payment_time', type: 'timestamp', nullable: true })
  paymentTime: Date;

  // Relationships
  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
