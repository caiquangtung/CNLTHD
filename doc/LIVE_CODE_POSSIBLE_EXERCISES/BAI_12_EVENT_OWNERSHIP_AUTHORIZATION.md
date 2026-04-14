# BAI 12 - EVENT OWNERSHIP AUTHORIZATION

## 1) Muc tieu
Dam bao organizer chi sua/xoa duoc event cua minh, admin duoc thao tac tat ca.

## 2) File can sua
- `src/modules/events/events.controller.ts`
- `src/modules/events/events.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Dam bao route private
Cho route update/delete:
- `@UseGuards(JwtAuthGuard, RolesGuard)`
- `@Roles(UserRole.ADMIN, UserRole.ORGANIZER)`
- Nhan `@CurrentUser()` trong controller.

### Buoc 2: Check ownership trong service
Flow:
1. Tim event theo id.
2. Neu role user la `ADMIN` -> cho phep.
3. Neu role user la `ORGANIZER`:
   - So sanh `event.organizerId === currentUser.id`
   - Sai -> `ForbiddenException`.

### Buoc 3: Tiep tuc update/delete
Chi sau khi pass check ownership moi duoc save hoac soft remove.

## 4) Mau ham day du
```ts
async update(
  eventId: string,
  dto: UpdateEventDto,
  currentUser: CurrentUserPayload,
): Promise<Event> {
  const event = await this.eventRepo.findOne({ where: { id: eventId } });
  if (!event) {
    throw new NotFoundException(`Event with id "${eventId}" not found`);
  }

  if (
    currentUser.role !== UserRole.ADMIN &&
    event.organizerId !== currentUser.id
  ) {
    throw new ForbiddenException('You cannot modify this event');
  }

  Object.assign(event, dto);
  return this.eventRepo.save(event);
}
```

## 5) Test nhanh
- Organizer owner update event -> 200.
- Organizer khac owner update event -> 403.
- Admin update/delete event bat ky -> 200.
