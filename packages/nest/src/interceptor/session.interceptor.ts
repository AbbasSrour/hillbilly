import type { AuthSession } from "@/types/auth";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ContextProvider } from "@/provider/context.provider";

// TODO this needs more work
@Injectable()
export class SessionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    ContextProvider.setSession(undefined as unknown as AuthSession);
    return next.handle();
  }
}
