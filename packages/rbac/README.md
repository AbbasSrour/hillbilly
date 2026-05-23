# @hillbilly/rbac

A Role-Based Access Control (RBAC) plugin for [Better Auth](https://github.com/better-auth/better-auth).

This plugin adds comprehensive RBAC capabilities to your Better Auth application, including:

- **Database Schema**: Automatically adds tables for `role`, `permission`, and `rolePermission`.
- **Permission Management**: Define permissions in code and sync them to the database.
- **Role Management**: Create, update, and delete roles via API or client.
- **Assignment**: Assign permissions to roles.
- **Session Enhancement**: Automatically adds the user's permissions to the session object for easy client-side checks.
- **API Endpoints**: Full suite of endpoints for managing RBAC resources.

## Installation

```bash
npm install @hillbilly/rbac
```

_Note: This package is currently part of the Pins workspace._

## Getting Started

### 1. Server Configuration

Add the `rbac` plugin to your Better Auth server configuration. You can define your application's permissions here to have them automatically synced to the database.

```typescript
import { betterAuth } from "better-auth";
import { rbac } from "@hillbilly/rbac";

export const auth = betterAuth({
  // ... other config
  plugins: [
    rbac({
      permissions: [
        {
          code: "users:read",
          name: "Read Users",
          description: "Allows reading user data",
        },
        {
          code: "users:write",
          name: "Write Users",
          description: "Allows creating and updating users",
        },
        // ... more permissions
      ],
      sync: true, // Sync permissions to database on startup (default: true)
    }),
  ],
});
```

### 2. Client Configuration

Add the `rbacClient` plugin to your Better Auth client configuration to enable the client-side API.

```typescript
import { createAuthClient } from "better-auth/client";
import { rbacClient } from "@hillbilly/rbac";

export const authClient = createAuthClient({
  // ... other config
  plugins: [rbacClient()],
});
```

## Usage

### Checking Permissions

#### Client-Side

The `checkPermission` method checks if the current user has the required permission(s).

```typescript
// Check a single permission
const { data, error } = await authClient.rbac.checkPermission({
  permission: "users:read",
});

if (data?.hasPermission) {
  // User has permission
}

// Check multiple permissions (requires ALL)
const { data } = await authClient.rbac.checkPermission({
  permission: ["users:read", "users:write"],
});
```

#### Session Data

The plugin automatically enhances the session user object with a `permissions` array. This allows for synchronous checks without making an API call.

```typescript
const session = await authClient.getSession();

if (session.user.permissions.includes("users:read")) {
  // Render protected component
}
```

### Managing Roles (Admin)

The client plugin exposes methods to manage roles. These endpoints typically require admin privileges (secured by your application's policies).

```typescript
// List roles
const { data: roles } = await authClient.rbac.listRoles();

// Create a role
const { data: newRole } = await authClient.rbac.createRole({
  name: "Editor",
  description: "Can edit content",
  permissionIds: ["perm_id_1", "perm_id_2"], // Optional initial permissions
});

// Update a role
await authClient.rbac.updateRole({
  roleId: "role_id_123",
  name: "Senior Editor",
});

// Delete a role
await authClient.rbac.deleteRole({
  roleId: "role_id_123",
});
```

### Managing Permissions

You can list available permissions and manage assignments to roles.

```typescript
// List all permissions
const { data: permissions } = await authClient.rbac.listPermissions();

// Assign permission to role
await authClient.rbac.assignPermission({
  roleId: "role_id_123",
  permissionId: "perm_id_456",
});

// Remove permission from role
await authClient.rbac.removePermission({
  roleId: "role_id_123",
  permissionId: "perm_id_456",
});

// List permissions for a specific role
const { data: rolePermissions } = await authClient.rbac.listRolePermissions({
  roleId: "role_id_123",
});
```

### Syncing

You can trigger a manual sync of permissions defined in your config to the database.

```typescript
await authClient.rbac.sync();
```

## Database Schema

The plugin adds the following tables to your database:

- **role**: Stores role definitions (`name`, `description`).
- **permission**: Stores permission definitions (`code`, `name`, `description`).
- **rolePermission**: Junction table linking roles and permissions.

### Customizing the Schema

You can customize the schema by passing a `schema` option to the RBAC plugin. This follows the same pattern as other Better Auth plugins like `organization` and `stripe`.

#### Custom Table Names

```typescript
rbac({
  permissions: [...],
  schema: {
    role: {
      modelName: "roles",  // Map "role" table to "roles"
    },
    permission: {
      modelName: "permissions",
    },
    rolePermission: {
      modelName: "role_permissions",
    },
  },
});
```

#### Additional Fields

You can add custom fields to the RBAC tables. These fields will be included in API request/response payloads.

```typescript
import { betterAuth } from "better-auth";
import { rbac } from "@hillbilly/rbac";

export const auth = betterAuth({
  plugins: [
    rbac({
      permissions: [...],
      schema: {
        role: {
          additionalFields: {
            // Add a color field for UI display
            color: {
              type: "string",
              required: false,
              defaultValue: "#3b82f6",
            },
            // Add a priority for sorting
            priority: {
              type: "number",
              defaultValue: 0,
            },
            // Add a system flag (not user-settable)
            isSystem: {
              type: "boolean",
              defaultValue: false,
              input: false,  // Cannot be set via API
            },
          },
        },
        permission: {
          additionalFields: {
            // Categorize permissions
            category: {
              type: "string",
              required: false,
            },
          },
        },
      },
    }),
  ],
});
```

##### Field Attributes

Each additional field can have the following properties:

| Property       | Type                                          | Description                                                             |
| -------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `type`         | `"string" \| "number" \| "boolean" \| "date"` | The data type of the field (required)                                   |
| `required`     | `boolean`                                     | Whether the field is required when creating a record (default: `false`) |
| `defaultValue` | `string \| number \| boolean \| Date`         | Default value for the field                                             |
| `input`        | `boolean`                                     | Whether this field can be set via API (default: `true`)                 |
| `unique`       | `boolean`                                     | Whether the field value must be unique (default: `false`)               |

#### Client-Side Type Inference

When using additional fields, you can get proper TypeScript types on the client side using `inferRbacAdditionalFields`:

**Option 1: Import from server (monorepo/same project)**

```typescript
import { createAuthClient } from "better-auth/client";
import { rbacClient, inferRbacAdditionalFields } from "@hillbilly/rbac";
import type { auth } from "./auth"; // Import the auth type

export const authClient = createAuthClient({
  plugins: [
    rbacClient({
      schema: inferRbacAdditionalFields<typeof auth>(),
    }),
  ],
});
```

**Option 2: Manual schema (separate projects)**

```typescript
import { createAuthClient } from "better-auth/client";
import { rbacClient, inferRbacAdditionalFields } from "@hillbilly/rbac";

export const authClient = createAuthClient({
  plugins: [
    rbacClient({
      schema: inferRbacAdditionalFields({
        role: {
          additionalFields: {
            color: { type: "string" },
            priority: { type: "number" },
          },
        },
      }),
    }),
  ],
});
```

## Types

### RBACPluginConfig

```typescript
interface RBACPluginConfig<S extends RBACSchemaConfig = RBACSchemaConfig> {
  permissions: PermissionDefinition[];
  sync?: boolean; // Default: true
  onPermissionCheck?: (data: {
    userId: string;
    permission: string;
    hasPermission: boolean;
  }) => Promise<void>;
  schema?: S; // Schema customization options
}

interface PermissionDefinition {
  code: string;
  name: string;
  description?: string;
}

interface RBACSchemaConfig {
  role?: TableSchemaConfig;
  permission?: TableSchemaConfig;
  rolePermission?: TableSchemaConfig;
}

interface TableSchemaConfig {
  modelName?: string;
  fields?: Record<string, string>; // Field name mappings
  additionalFields?: Record<string, FieldAttribute>;
}

interface FieldAttribute {
  type: "string" | "number" | "boolean" | "date";
  required?: boolean;
  defaultValue?: string | number | boolean | Date;
  input?: boolean;
  unique?: boolean;
}
```
