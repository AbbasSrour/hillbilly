/* @hillbilly-sync */
import { SessionEntity } from '@/module/auth/entity/session.entity';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ContextProvider } from '@/provider/context.provider';

// TODO this needs more work
@Injectable()
export class SessionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    ContextProvider.setSession(undefined as unknown as SessionEntity);
    return next.handle();
  }
}
