import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAccountEntity } from '../../../domain/entities/user-account.entity.js';
import { AuthenticatedRequest } from '../guards/jwt-auth.guard.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserAccountEntity | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
