# BAI 02 - RESTORE USER (SOFT DELETE)

## 1) Muc tieu
Them API cho admin khoi phuc user da bi soft-delete.

## 2) File can sua
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Them route restore
Trong controller:
- Route: `PATCH /users/:id/restore`
- Guard: `JwtAuthGuard`, `RolesGuard`
- Role: `@Roles(UserRole.ADMIN)`
- Param: `@Param('id', ParseUUIDPipe) id: string`

### Buoc 2: Tim user da xoa
Trong service:
- Dung `repo.findOne({ where: { id }, withDeleted: true })`
- Neu khong co -> `NotFoundException`
- Neu `deletedAt` rong -> `BadRequestException('User is not deleted')`

### Buoc 3: Restore va tra ve
- `await this.userRepo.restore(id)`
- Goi lai `findById(id)` (khong withDeleted) de lay ban ghi moi nhat.

## 4) Mau ham day du
```ts
async restore(id: string): Promise<User> {
  const deletedUser = await this.userRepo.findOne({
    where: { id },
    withDeleted: true,
  });
  if (!deletedUser) {
    throw new NotFoundException(`User with id "${id}" not found`);
  }
  if (!deletedUser.deletedAt) {
    throw new BadRequestException('User is not deleted');
  }

  await this.userRepo.restore(id);
  return this.findById(id);
}
```

## 5) Test nhanh
- Admin restore user da xoa -> 200.
- Admin restore user chua xoa -> 400.
- Non-admin goi endpoint -> 403.
