import { CanActivate, UseGuards, UseInterceptors, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

import { ApiErrorResponse } from '@/decorator/api-error-response.decorator';
import { Permissions } from '@/decorator/permission.decorator';
import { PublicRoute } from '@/decorator/public-route.decorator';
import { PermissionGuard } from '@/guard/permission.guard';
import { AuthUserInterceptor } from '@/interceptor/auth-user.interceptor';
import { UnauthorizedException } from '@/exception/unauthorized.exception';

// biome-ignore lint/complexity/noBannedTypes: Type from NestJs
type NestGuard = CanActivate | Function;

interface IAuthOptions {
  public?: boolean;
  permissions?: string[];
}

export function Auth(options?: IAuthOptions, ...guards: NestGuard[]): MethodDecorator {
  const { public: isPublic = false, permissions = [] } = options ?? {};

  const decorators: MethodDecorator[] = [
    PublicRoute(isPublic),
    Permissions(permissions),
    UseInterceptors(AuthUserInterceptor),
  ];

  if (isPublic) {
    decorators.push(AllowAnonymous());
  } else {
    decorators.push(ApiBearerAuth());
    decorators.push(ApiErrorResponse(UnauthorizedException));
  }

  const appliedGuards: NestGuard[] = [...guards];

  if (!isPublic && permissions.length > 0) {
    appliedGuards.push(PermissionGuard);
  }

  if (appliedGuards.length > 0) {
    return applyDecorators(...decorators, UseGuards(...appliedGuards));
  }

  return applyDecorators(...decorators);
}
