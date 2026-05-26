import type { AuthSession } from '@/types/auth';
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthSession | undefined => {
    const request = context.switchToHttp().getRequest<Request & { session?: AuthSession }>();

    const session = request.session;

    if (session?.user?.[Symbol.for('isPublic')]) {
      return;
    }

    return session;
  },
);
