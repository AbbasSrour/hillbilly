import { Permissions } from '@/decorator/permission.decorator';
import { CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  type EnhancedSessionUser,
  hasPermissions,
  userHasAllPermissions,
} from '@hillbilly/rbac';
import type { Request } from 'express';
import { isEmpty } from 'lodash';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get(
      Permissions,
      context.getHandler(),
    );

    if (isEmpty(requiredPermissions)) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { session?: { user: EnhancedSessionUser } }>();
    const user = request.session?.user;

    if (!user || !hasPermissions(user)) {
      return false;
    }

    return userHasAllPermissions(user, requiredPermissions);
  }
}
