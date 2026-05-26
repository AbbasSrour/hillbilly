// ============================================================================
// Shared Types & Utilities
// ============================================================================
// This is the main export. Only shared types and utilities should be exported.
// Client code should import from '@hillbilly/rbac/client'
// Server code should import from '@hillbilly/rbac/server'

// Export schema utilities (can be used by both client and server)
export { baseSchema, buildSchema, schema } from './schema';
// Export all shared types
export * from './types/index';
export * from './utils/access-control';
// Export shared utilities
export * from './utils/admin-permissions';
