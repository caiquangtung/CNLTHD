import { createParamDecorator, ExecutionContext } from '@nestjs/common';

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

    // Nếu truyền key (ví dụ: @CurrentUser('id')) thì trả về đúng trường đó
    if (data) {
      return user?.[data];
    }

    // Nếu không truyền gì thì trả về toàn bộ đối tượng user
    return user;
  },
);