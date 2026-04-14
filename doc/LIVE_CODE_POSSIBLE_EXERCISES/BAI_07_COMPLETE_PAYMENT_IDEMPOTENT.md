# BAI 07 - COMPLETE PAYMENT IDEMPOTENT

## 1) Muc tieu
Xu ly callback thanh toan sao cho goi lap lai khong tao side effect moi.

## 2) File can sua
- `src/modules/payments/payments.controller.ts`
- `src/modules/payments/payments.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Them endpoint
- Route: `POST /payments/:id/complete`
- Co the de private hoac verify theo gateway callback signature (neu de bai yeu cau).

### Buoc 2: Lock payment + order
Trong service:
- transaction manager
- lock payment row `pessimistic_write`
- load order lien quan

### Buoc 3: Idempotent check
- Neu payment da `SUCCESS`: return trang thai hien tai ngay.
- Neu payment khong phai `PENDING`: throw 400.
- Neu order khong phai `PENDING`: throw 400.

### Buoc 4: Update atomically
- payment -> `SUCCESS`
- order -> `PAID`
- save trong 1 transaction.

## 4) Mau ham day du
```ts
async completePayment(paymentId: string): Promise<Payment> {
  return this.dataSource.transaction(async (manager) => {
    const payment = await manager.findOne(Payment, {
      where: { id: paymentId },
      relations: ['order'],
      lock: { mode: 'pessimistic_write' },
    });
    if (!payment) {
      throw new NotFoundException(`Payment with id "${paymentId}" not found`);
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return payment; // idempotent
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Invalid payment state');
    }
    if (payment.order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not pending');
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.order.status = OrderStatus.PAID;
    await manager.save(payment.order);
    return manager.save(payment);
  });
}
```

## 5) Test nhanh
- Goi lan 1: pending -> success.
- Goi lan 2 cung payment: van 200, khong doi du lieu them.
