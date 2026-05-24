# @hillbilly/nest

Shared NestJS backend utilities for Hillbilly projects.

## Auth type augmentation

`@hillbilly/nest` exposes two auth interfaces that applications can extend:

```ts
import type { EnhancedSessionUser } from "@hillbilly/rbac";

export interface AuthUser extends EnhancedSessionUser {
  [key: symbol]: unknown;
}

export interface AuthSession {
  user?: AuthUser | null;
  session?: unknown;
}
```

The shared auth decorators, interceptors, `PermissionGuard`, and `ContextProvider` use these interfaces instead of importing app-owned `UserEntity` or `SessionEntity` types. Applications can add their concrete Better Auth/session/entity fields with module augmentation:

```ts
// apps/backend/src/types/hillbilly-nest.d.ts
import type { UserEntity } from "../module/user/entity/user.entity";
import type { AuthSession as BetterAuthSession } from "../module/auth/type/auth";

declare module "@hillbilly/nest" {
  interface AuthUser extends UserEntity {}
  interface AuthSession extends BetterAuthSession {}
}
```

After augmentation, helpers such as `@AuthUser()`, `@Session()`, and `ContextProvider.getAuthUser()` use the app-specific types while the shared package remains independent from app auth entities.

The interfaces are defined in `src/types/auth.ts` and re-exported from the package root.

## Configurable translation language codes

`@hillbilly/nest` provides translation base classes that need a storage-level language-code enum, but the actual language list is project-specific. Configure the list once before MikroORM discovers entities.

```ts
// apps/backend/src/i18n/language-code.ts
import { configureLanguageCodes } from "@hillbilly/nest/constant/language-code.constant";

export const languageCodes = configureLanguageCodes(["en_US", "ar_LB"] as const);

declare module "@hillbilly/nest/constant/language-code.constant" {
  interface LanguageCodeRegistry {
    en_US: true;
    ar_LB: true;
  }
}

export type AppLanguageCode = (typeof languageCodes)[number];
```

Native enum support is enabled by default with the enum name `language_code`:

```ts
configureLanguageCodes(["en_US", "ar_LB"] as const, {
  nativeEnumName: "language_code",
});
```

Disable native enum naming and use MikroORM's default enum/check behavior:

```ts
configureLanguageCodes(["en_US", "ar_LB"] as const, {
  nativeEnumName: false,
});
```

Or choose based on the MikroORM platform:

```ts
configureLanguageCodes(["en_US", "ar_LB"] as const, {
  nativeEnumName: (platform) =>
    platform.constructor.name.includes("Postgre") ? "language_code" : false,
});
```

Import this module before MikroORM discovery/init:

```ts
import "./i18n/language-code";
```

The shared `AbstractTranslationEntity` uses:

```ts
@Enum({
  items: () => getLanguageCodes(),
})
languageCode!: LanguageCode;
```

Apply the configured native enum name in MikroORM's `discovery.onMetadata` hook. This hook is required because MikroORM initializes enum column types during discovery.

```ts
import { applyLanguageCodeEnumMetadata } from "@hillbilly/nest/constant/language-code.constant";

export default defineConfig({
  // ...
  discovery: {
    onMetadata: applyLanguageCodeEnumMetadata,
  },
});
```

This gives projects:

- project-specific enum values
- storage-level MikroORM enum metadata
- configurable PostgreSQL native enum support via `nativeEnumName`
- TypeScript narrowing through module augmentation
- no need for a project-specific translation base entity

If no module augmentation is provided, `LanguageCode` falls back to `string`.
