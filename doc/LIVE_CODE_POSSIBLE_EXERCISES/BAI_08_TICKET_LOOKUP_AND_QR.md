# BAI 08 - TRA CUU TICKET THEO CODE + QR

## 1) Muc tieu
Tim ticket theo `ticketCode` va cung cap QR base64 cho client render.

## 2) File can sua
- `src/modules/tickets/tickets.controller.ts`
- `src/modules/tickets/tickets.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Them route tra cuu code
- `GET /tickets/code/:ticketCode`
- Goi `ticketsService.findByCode(ticketCode)`
- Neu khong co -> 404.

### Buoc 2: Them route lay QR
- `GET /tickets/:id/qr`
- Goi `ticketsService.generateQrBase64(id)`
- Tra base64 theo field ro rang (`qrBase64`).

### Buoc 3: Viet service methods
- `findByCode`: query theo code + relation can thiet (event/order).
- `generateQrBase64`:
  1. Tim ticket
  2. Build payload (vd: ticketCode + eventId)
  3. Generate base64 bang lib QR.

## 4) Mau ham day du
```ts
async findByCode(ticketCode: string): Promise<Ticket> {
  const ticket = await this.ticketRepo.findOne({
    where: { ticketCode },
    relations: ['event', 'order'],
  });
  if (!ticket) {
    throw new NotFoundException(`Ticket with code "${ticketCode}" not found`);
  }
  return ticket;
}

async generateQrBase64(id: string): Promise<string> {
  const ticket = await this.findById(id);
  const payload = JSON.stringify({
    ticketCode: ticket.ticketCode,
    eventId: ticket.eventId,
    orderId: ticket.orderId,
  });
  return QRCode.toDataURL(payload);
}
```

## 5) Test nhanh
- Code hop le -> tra ticket.
- Code sai -> 404.
- Endpoint QR -> co chuoi `data:image/png;base64,...`.
