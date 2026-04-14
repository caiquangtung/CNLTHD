# BAI 05 - HUY ORDER + HOAN TON KHO

## 1) Muc tieu
Huy order an toan khi co nhieu request dong thoi, dam bao ton kho duoc cong lai.

## 2) File can sua
- `src/modules/orders/orders.controller.ts`
- `src/modules/orders/orders.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Endpoint cancel
- Route: `PATCH /orders/:id/cancel`
- Guard: `JwtAuthGuard`
- Nhan `@CurrentUser()` de check owner/admin.

### Buoc 2: Bat dau transaction
Trong service:
- `this.dataSource.transaction(async manager => { ... })`
- Lock order: `pessimistic_write`.

### Buoc 3: Validate state + permission
- Order khong ton tai -> 404.
- Neu user khong phai owner va khong phai admin -> 403.
- Neu status khong phai `PENDING` -> 400.

### Buoc 4: Restore inventory
- Lay `orderItems`.
- Loop tung item:
  - lock `ticketType`
  - `quantity = quantity + item.quantity`
  - save lai

### Buoc 5: Cap nhat trang thai
- order -> `CANCELLED`
- payment pending (neu co) -> `CANCELLED`
- save trong cung transaction.

## 4) Mau ham day du
```ts
async cancelOrder(orderId: string, actor: CurrentUserPayload): Promise<Order> {
  return this.dataSource.transaction(async (manager) => {
    const order = await manager.findOne(Order, {
      where: { id: orderId },
      relations: ['items', 'payment'],
      lock: { mode: 'pessimistic_write' },
    });
    if (!order) {
      throw new NotFoundException(`Order with id "${orderId}" not found`);
    }
    const isAdmin = actor.role === UserRole.ADMIN;
    if (!isAdmin && order.userId !== actor.id) {
      throw new ForbiddenException('You cannot cancel this order');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending order can be cancelled');
    }

    await this.restoreInventory(manager, order.items);
    order.status = OrderStatus.CANCELLED;

    if (order.payment?.status === PaymentStatus.PENDING) {
      order.payment.status = PaymentStatus.CANCELLED;
      await manager.save(order.payment);
    }

    return manager.save(order);
  });
}

private async restoreInventory(
  manager: EntityManager,
  items: OrderItem[],
): Promise<void> {
  for (const item of items) {
    const ticketType = await manager.findOne(TicketType, {
      where: { id: item.ticketTypeId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!ticketType) continue;
    ticketType.quantity += item.quantity;
    await manager.save(ticketType);
  }
}
```

## 5) Test nhanh
- Pending order cancel -> 200 + inventory tang lai.
- Cancel lan 2 -> 400.
- User khac order owner -> 403.
