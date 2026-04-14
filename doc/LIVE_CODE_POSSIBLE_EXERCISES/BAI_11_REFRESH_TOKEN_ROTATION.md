# BAI 11 - REFRESH TOKEN ROTATION

## 1) Muc tieu
Hoan thien flow refresh token rotation: moi lan refresh phai cap token moi, token cu khong dung lai duoc.

## 2) File can sua
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/users/users.service.ts`

## 3) Cac buoc lam chi tiet

### Buoc 1: Endpoint refresh
- Route: `POST /auth/refresh`
- Nhan body: `userId`, `refreshToken`.

### Buoc 2: Verify refresh token
Trong service:
1. Tim user theo `userId`.
2. So sanh `refreshToken` plaintext voi hash luu DB (`bcrypt.compare`).
3. Sai -> `UnauthorizedException`.

### Buoc 3: Issue cap token moi
- Tao access token moi.
- Tao refresh token moi (random + jwt sign).
- Hash refresh moi va cap nhat vao user.

### Buoc 4: Tra ve token moi
Response:
- `accessToken`
- `refreshToken`

## 4) Mau ham day du
```ts
async refreshTokens(
  userId: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  await this.validateRefreshToken(userId, refreshToken);
  const tokens = await this.issueTokenPair(user);
  await this.usersService.updateRefreshTokenHash(user.id, tokens.refreshToken);
  return tokens;
}

async validateRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const user = await this.usersService.findById(userId);
  if (!user?.refreshTokenHash) {
    throw new UnauthorizedException('Refresh token is invalid');
  }
  const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isMatch) {
    throw new UnauthorizedException('Refresh token is invalid');
  }
}
```

## 5) Test nhanh
- Login -> lay refresh A.
- Refresh bang A -> nhan refresh B.
- Goi lai refresh bang A -> 401.
- Goi refresh bang B -> thanh cong.
