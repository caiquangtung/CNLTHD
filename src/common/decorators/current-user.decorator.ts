import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If data specified (e.g., @CurrentUser('id')), return that field
    if (data) {
      return user?.[data];
    }

    // Otherwise return entire user object
    return user;
  },
);