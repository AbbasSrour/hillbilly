import { RoleWithPermissions as RoleWithPermissionsModel } from './schema';
import type { Permission } from './schema';

export interface SyncResponse {
  permissions: {
    created: number;
    existing: number;
  };
  roles: {
    created: number;
    existing: number;
  };
  mappings: {
    synced: number;
    skipped: number;
  };
}

export interface Role extends RoleWithPermissionsModel {
  isStatic: boolean;
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total: number;
}

export interface RoleResponse {
  role: Role;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
  checked: string[];
  userPermissions: string[];
}

export interface UserPermissionsResponse {
  role: {
    id: string;
    name: string;
  } | null;
  permissions: Permission[];
}
