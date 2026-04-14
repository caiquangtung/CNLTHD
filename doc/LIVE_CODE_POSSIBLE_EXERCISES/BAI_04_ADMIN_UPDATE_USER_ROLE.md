# BAI 04 - ADMIN CAP NHAT ROLE USER

## 1) Muc tieu
Cho phep admin doi role user, co rule chan admin tu ha role chinh minh.

## 2) File can sua
- `src/modules/users/dto/update-user-role.dto.ts` (tao moi)
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Tao DTO
`UpdateUserRoleDto`:
- `role: UserRole`
- Validator: `@IsEnum(UserRole)`

### Buoc 2: Them endpoint admin
Controller:
- Route: `PATCH /admin/users/:id/role`
- Guard + role admin
- Nhan `@CurrentUser('id') adminId`
- Body: DTO role

### Buoc 3: Xu ly business rule
Service:
1. Tim target user, khong co -> 404.
2. Neu `adminId === targetUserId && dto.role !== ADMIN` -> 400.
3. Gan role moi, save, tra ve user.

## 4) Mau ham day du
```ts
async updateRole(
  targetUserId: string,
  dto: UpdateUserRoleDto,
  adminId: string,
): Promise<User> {
  const user = await this.userRepo.findOne({ where: { id: targetUserId } });
  if (!user) {
    throw new NotFoundException(`User with id "${targetUserId}" not found`);
  }
  if (adminId === user.id && dto.role !== UserRole.ADMIN) {
    throw new BadRequestException('Admin cannot downgrade self role');
  }

  user.role = dto.role;
  return this.userRepo.save(user);
}
```

## 5) Test nhanh
- Admin doi role user thuong -> 200.
- Admin tu ha role -> 400.
- User thuong goi endpoint -> 403.
