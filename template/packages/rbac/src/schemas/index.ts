/**
 * Shared Zod schemas for endpoint validation
 */
import { z } from 'zod';

/**
 * Common pagination query schema
 */
export const paginationQuerySchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

/**
 * Create role request schema
 */
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

/**
 * Update role request schema
 */
export const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

/**
 * Update role request schema with roleId
 */
export const updateRoleWithIdSchema = updateRoleSchema.extend({
  roleId: z.string(),
});

/**
 * Check permission request schema
 */
export const checkPermissionSchema = z.object({
  permission: z.union([z.string(), z.array(z.string())]),
});

/**
 * Get role query schema
 */
export const getRoleQuerySchema = z.object({
  roleId: z.string(),
});

/**
 * Delete role request schema
 */
export const deleteRoleSchema = z.object({
  roleId: z.string(),
});

/**
 * List role permissions query schema
 */
export const listRolePermissionsQuerySchema = z.object({
  roleId: z.string(),
});

/**
 * Assign permission request schema
 */
export const assignPermissionSchema = z.object({
  roleId: z.string(),
  permissionId: z.string(),
});

/**
 * Remove permission request schema
 */
export const removePermissionSchema = z.object({
  roleId: z.string(),
  permissionId: z.string(),
});

/**
 * Inferred types from schemas
 */
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateRoleWithIdInput = z.infer<typeof updateRoleWithIdSchema>;
export type CheckPermissionInput = z.infer<typeof checkPermissionSchema>;
export type GetRoleQuery = z.infer<typeof getRoleQuerySchema>;
export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>;
export type ListRolePermissionsQuery = z.infer<typeof listRolePermissionsQuerySchema>;
export type AssignPermissionInput = z.infer<typeof assignPermissionSchema>;
export type RemovePermissionInput = z.infer<typeof removePermissionSchema>;
