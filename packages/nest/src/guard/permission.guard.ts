import { Permissions } from "@/decorator/permission.decorator";
import type { AuthSession } from "@/types/auth";
import { CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasPermissions, userHasAllPermissions } from "@hillbilly/rbac";
import type { Request } from "express";
import _ from "lodash";
const { isEmpty } = _;

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get(Permissions, context.getHandler());

    if (isEmpty(requiredPermissions)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { session?: AuthSession }>();
    const user = request.session?.user;

    if (!user || !hasPermissions(user)) {
      return false;
    }

    return userHasAllPermissions(user, requiredPermissions);
  }
}
