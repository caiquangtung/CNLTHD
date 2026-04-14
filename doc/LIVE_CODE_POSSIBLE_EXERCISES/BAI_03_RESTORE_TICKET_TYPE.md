# BAI 03 - RESTORE TICKET TYPE

## 1) Muc tieu
Khoi phuc `TicketType` da bi soft-delete, co check quyen organizer/admin.

## 2) File can sua
- `src/modules/ticket-types/ticket-types.controller.ts`
- `src/modules/ticket-types/ticket-types.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Them route
- Route: `PATCH /ticket-types/:id/restore`
- Guard: `JwtAuthGuard`, `RolesGuard`
- Role cho phep: `ADMIN`, `ORGANIZER`
- Nhan `@CurrentUser()` de check ownership.

### Buoc 2: Query ban ghi da xoa + relation event
- `findOne(... withDeleted: true, relations: ['event'])`
- Neu khong ton tai -> 404.
- Neu chua bi xoa -> 400.

### Buoc 3: Check quyen
- Admin: duoc phep.
- Organizer: chi duoc restore khi `event.organizerId === currentUser.id`.
- Sai quyen -> `ForbiddenException`.

### Buoc 4: Restore
- `await this.ticketTypeRepo.restore(id)`
- Lay lai entity va tra response.

## 4) Mau ham day du
```ts
async restore(
  id: string,
  currentUser: CurrentUserPayload,
): Promise<TicketType> {
  const ticketType = await this.ticketTypeRepo.findOne({
    where: { id },
    withDeleted: true,
    relations: ['event'],
  });

  if (!ticketType) {
    throw new NotFoundException(`Ticket type with id "${id}" not found`);
  }
  if (!ticketType.deletedAt) {
    throw new BadRequestException('Ticket type is not deleted');
  }
  if (
    currentUser.role !== UserRole.ADMIN &&
    ticketType.event.organizerId !== currentUser.id
  ) {
    throw new ForbiddenException('You cannot restore this ticket type');
  }

  await this.ticketTypeRepo.restore(id);
  return this.findById(id);
}
```

## 5) Test nhanh
- Organizer owner restore -> 200.
- Organizer khong owner restore -> 403.
- Admin restore -> 200.
