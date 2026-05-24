/* @hillbilly-sync */
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { UserEntity } from '@/module/user/entity/user.entity';
import { ContextProvider } from '@/provider/context.provider';

@Injectable()
export class AuthUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: { user: UserEntity } }>();

    const user = request.session?.user;

    if (user) {
      ContextProvider.setAuthUser(user);
    }

    return next.handle();
  }
}
