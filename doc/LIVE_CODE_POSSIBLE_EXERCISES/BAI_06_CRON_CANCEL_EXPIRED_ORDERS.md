# BAI 06 - CRON TU DONG HUY ORDER QUA HAN

## 1) Muc tieu
Moi phut quet va huy cac order `PENDING` da qua `expiresAt`.

## 2) File can sua
- `src/cron/order-cron.service.ts`
- `src/modules/orders/orders.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Tao cron method
Trong `order-cron.service.ts`:
- Them `@Cron(CronExpression.EVERY_MINUTE)`
- Goi `ordersService.cancelExpiredOrders()`

### Buoc 2: Viet service cancelExpiredOrders
1. Query danh sach order:
   - `status = PENDING`
   - `expiresAt < now`
2. Loop tung order:
   - Goi chung logic cancel an toan (transaction) da co.
3. Dem so luong order thanh cong va log.

### Buoc 3: Tranh duplicate logic
Khong copy/paste cancel flow.
Thiet ke:
- `cancelOrderBySystem(orderId)` hoac
- `cancelOrder(orderId, actor)` co flag actor system.

## 4) Mau ham day du
```ts
@Cron(CronExpression.EVERY_MINUTE)
async handleExpireOrders(): Promise<void> {
  const count = await this.ordersService.cancelExpiredOrders();
  this.logger.log(`Expired orders processed: ${count}`);
}

async cancelExpiredOrders(): Promise<number> {
  const expiredOrders = await this.orderRepo.find({
    where: {
      status: OrderStatus.PENDING,
      expiresAt: LessThan(new Date()),
    },
    select: ['id'],
  });

  let processed = 0;
  for (const order of expiredOrders) {
    try {
      await this.cancelOrderBySystem(order.id);
      processed += 1;
    } catch {
      // Bo qua order loi de cron tiep tuc xu ly cac order con lai
    }
  }
  return processed;
}
```

## 5) Test nhanh
- Tao pending order co `expiresAt` trong qua khu -> cho cron chay -> order thanh `CANCELLED`.
- Kiem tra inventory da duoc cong lai.
