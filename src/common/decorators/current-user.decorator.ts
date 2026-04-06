import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Decorator `@CurrentUser()` lấy thông tin người dùng từ request.
 *
 * Được dùng trong các controller domain (ví dụ `EventsController`)
 * để lấy `id`/`role` phục vụ logic phân quyền trong service.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Nếu truyền key (ví dụ: @CurrentUser('id')) thì trả về đúng trường đó
    if (data) {
      const value = user[data];
      if (value === undefined || value === null) {
        throw new UnauthorizedException(`User ${data} not found`);
      }
      return value;
    }

    // Nếu không truyền gì thì trả về toàn bộ đối tượng user
    return user;
  },
);