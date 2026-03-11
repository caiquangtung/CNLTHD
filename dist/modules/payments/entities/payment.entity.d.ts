import { BaseEntity } from '../../../common/entities';
import { Order } from '../../orders/entities/order.entity';
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    BANK_TRANSFER = "bank_transfer",
    E_WALLET = "e_wallet",
    CASH = "cash"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Payment extends BaseEntity {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
    paymentTime: Date;
    order: Order;
}
