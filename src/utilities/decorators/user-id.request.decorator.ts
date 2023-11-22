import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserIDFromRequest = createParamDecorator(
  (data, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    return req.userID;
  },
);
