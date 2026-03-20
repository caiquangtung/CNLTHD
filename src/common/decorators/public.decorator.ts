import { SetMetadata } from '@nestjs/common';

/**
 * Decorator `@Public()` đánh dấu route không cần JWT.
 *
 * Được JwtAuthGuard (common/guards) đọc qua metadata `IS_PUBLIC_KEY`
 * để bỏ qua xác thực cho các route như `GET /events`, `GET /ticket-types`,...
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
