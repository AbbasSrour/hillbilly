import type { AuthSession } from '@/types/auth';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const AuthUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request & { session?: AuthSession }>();

  const user = request.session?.user;

  if (user?.[Symbol.for('isPublic')]) {
    return;
  }

  return user;
});
