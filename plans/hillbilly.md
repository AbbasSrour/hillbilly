# Hillbilly — Monorepo Template + Shared Packages

## Goal

A single monorepo that:

1. **Scaffolds new projects** via Copier with backend/frontend boilerplate pre-wired
2. **Publishes truly reusable shared packages** to `@hillbilly/*` on npm (`ui`, `rbac`, future `sdk`)
3. **Syncs boilerplate changes** via Copier/template update flows, with a planned reverse-sync helper for promoting generated-project changes back into `template/`

## Key Decisions

- **Repo name**: `hillbilly`
- **Package manager**: bun (1.3.14)
- **Scope**: `@hillbilly` on npm
- **Template structure**: Separate `template/` subdirectory via `_subdirectory: template` in `copier.yaml`. Root is hillbilly's own tooling — no leakage into consumer projects.
- **Vite+ role**: One-time template source — initial scaffold committed into `template/` as static files. Copier handles copy + update. **No `vp create` during Copier runs**.
- **tsconfig**: Template-only via Copier (NOT a published npm package)
- **Package publishing**: release-it per package for reusable libraries only. Each retained `packages/*/` has its own `.release-it.json`. Independent versions, per-package changelog.
- **Format/Lint**: Vite+ (`vp check` via lint-staged), no biome
- **VCS hooks**: `.vite-hooks/` (commit-msg, pre-commit, prepare-commit-msg) using `npx` (Vite+ dispatcher sets PATH to `node_modules/.bin`)
- **Template drift**: Root configs and template configs are intentionally separate. Root = hillbilly dev tooling. Template = minimal consumer scaffold.
- **Nest boilerplate ownership**: Nest helper/boilerplate code lives directly in the generated backend template, not in a published `@hillbilly/nest` package. The package boundary caused ESM/Rspack/MikroORM/tsdown helper friction; template-owned source keeps runtime and metadata discovery simple.
- **Two-way boilerplate DX**: Use Copier for template → project updates. Add a Hillbilly reverse-sync helper later for project → template promotion, scoped to template-owned paths only.

## Packages (published to npm)

| Package           | Status        | Publishing             |
| ----------------- | ------------- | ---------------------- |
| `@hillbilly/ui`   | ✅ scaffolded | release-it per package |
| `@hillbilly/rbac` | ✅ scaffolded | release-it per package |
| `@hillbilly/sdk`  | ⬜ planned    | release-it per package |

## Template (Copier) — flat config files

- `.editorconfig`
- `.github/workflows/` — deploy templates with `{{ project_name }}`, `{{ gcp_project_id }}`
- `commitlint.config.ts`
- `.lintstagedrc.json`
- `.release-it.json` — project-level release (not package publishing)
- `.vite-hooks/`
- `tsconfig/` — base, nestjs, nextjs, react-library, start presets
- `package.json` — depends on reusable `@hillbilly/*` packages from npm (NOT workspace protocol); Nest boilerplate is copied as source into the generated backend.

## Scaffolded Project Structure

```
{{ project_name }}/
├── packages/
│   └── tsconfig/    # Copier-managed tsconfig presets (workspace package)
├── apps/
│   ├── backend/     # NestJS, local boilerplate source + @hillbilly/rbac
│   └── web/         # Frontend, wired with @hillbilly/ui
├── .github/workflows/
├── package.json     # depends on reusable @hillbilly/* packages
└── tsconfig.json    # extends ./packages/tsconfig/base.json
```

## Progress

### Done

- [x] Scaffolded via `vp create vite:monorepo` (bun, hooks, git)
- [x] Cleaned scaffold defaults (`packages/utils`, `apps/website`)
- [x] Simplified `package.json` (workspaces to `packages/*` only)
- [x] Copied root configs from ticklet: `.editorconfig`, `commitlint.config.ts`, `.lintstagedrc.json`, `.release-it.json`
- [x] Wired `.vite-hooks/`: pre-commit → lint-staged, commit-msg → commitlint, prepare-commit-msg → commitizen
- [x] Added root deps + `bun install`: commitizen, commitlint, lint-staged, release-it + conventional-changelog
- [x] Created `copier.yaml` with `_subdirectory: template`, `_envops` for `[[ ]]` delimiters, `_message_after_copy`
- [x] Populated `template/` flat configs: editorconfig, commitlint, lintstagedrc (with valid `$schema`), release-it
- [x] Copied `.vite-hooks/_` shims + custom hooks into template (pre-commit, commit-msg, prepare-commit-msg)
- [x] Copied tsconfig presets into `template/tsconfig/` (base, nestjs, nextjs, react-library, start)
- [x] Created `template/tsconfig.json` extending `./tsconfig/base.json`
- [x] Created workflow templates (`.yaml.jinja`) with `[[ gcp_project_id ]]` + `[[ project_name ]]` variables
- [x] Created `template/package.json.jinja` with `@hillbilly/*` deps, `packageManager` from Copier choice
- [x] Added `template/vite.config.ts`, `template/.gitignore`
- [x] Fixed `apps/frontend` → `apps/web` naming consistency
- [x] Decided `@hillbilly/nest` should not own app-specific `ApiConfigService`; move backend config to template and wire shared services through package-level options.
- [x] Decided to drop the `@hillbilly/nest` package boundary entirely for backend boilerplate. Move helpers back into `template/apps/backend/src/` and rely on Copier plus a future reverse-sync helper for DX across generated repos.

### Recent (Session: 2026-05-24)

- Moved Nest helper code back into the backend template as local source directories (`abstract`, `decorator`, `filter`, `guard`, `interceptor`, `middleware`, `pipe`, `provider`, `types`, `utils`, `exception`, `interface`, `constant`, and package modules). Removed the `@hillbilly/nest` package boundary from the template direction.
- Fixed nest-cli.json — removed email asset entry (React Email .tsx is compiled, not copied by NestJS).
- Rewrote Dockerfile for bun workspaces (no turbo, monorepo root build context).
- Fixed docker-compose.yml and docker-compose_mysql.yml build context: `context: ../..`, `dockerfile: apps/backend/Dockerfile`.
- Merged pins `app.module.ts` into template: all infrastructure modules wired with `forRootAsync` via `ApiConfigService`.
- Fixed `ApiConfigService.twilioConfig` — gates on `TWILIO_ENABLED` (mirrors `smtpConfig` pattern).
- Copied auth module from pins (19 files): entities, DTOs, services, controller, `lib/auth.ts`, constants, provider. Imports now target local backend helpers (`@/abstract`, `@/decorator`, etc.) or relative paths.
- Copied `MaintenanceMiddleware` to template `src/middleware/`.
- AuthModule wired in `app.module.ts`.
- Migrated generated backend template for MikroORM v7:
  - Entity decorators now import from `@mikro-orm/decorators/legacy` because the template uses `experimentalDecorators: true`.
  - Non-decorator runtime types remain imported from `@mikro-orm/core`.
  - Removed obsolete MikroORM config options (`alwaysAnalyseProperties`, `strict`, `validate`) that v7 enables/removes by default.
  - Kept `EnsureRequestContext` from the legacy decorators package instead of changing behavior to `CreateRequestContext`.
- Fixed stale pins query-builder assumptions in `UserService`:
  - Removed invalid joins on scalar `role` and non-existent `profile`.
  - Kept the valid `settings` relation join.
  - Changed search fields from profile names to `user.name`.
- Aligned user DTO/service fields with the entity and Better Auth schema by renaming `phone` to `phoneNumber`.
- Fixed generated backend package/template wiring:
  - `template/apps/backend/package.json.jinja` remains the source so Copier can process `[[ project_name ]]`.
  - Generated backend depends on `@[[ project_name ]]/templates` for React Email templates.
  - Template Nest tsconfig preset enables `jsx: "react-jsx"` so `.tsx` email templates typecheck.
  - `ApiConfigService` gained `appName`, derived from `DOMAIN`.
  - RBAC runtime import uses `@hillbilly/rbac/server`; shared types remain from `@hillbilly/rbac`.
  - Language-code module augmentation targets local `@/constant`.
- Fixed Better Auth access-control merge for newer Better Auth versions:
  - Pins resolved `better-auth@1.4.17`, where `adminAc.statements` used mutable arrays.
  - The generated template currently resolves newer Better Auth (`1.6.x`), where `adminAc.statements` uses readonly tuple types.
  - `mergeStatementsWithBase` now accepts `Record<string, readonly string[]>` and returns the actual mutable merged `Record<string, string[]>` shape without call-site casts.
- Generated test project verification workflow uses the template's npm-style `"*"` reusable package dependencies, then locally patches only the disposable generated project for workspace testing where needed:
  ```bash
  rm -rf /home/ares/Projects/projects/test-nest && copier copy /home/ares/Projects/hillbilly/. /home/ares/Projects/projects/test-nest --defaults --data-file /tmp/copier-data.json 2>&1 | tail -1 && sed -i 's|"@hillbilly/rbac": "\*"|"@hillbilly/rbac": "link:@hillbilly/rbac"|' /home/ares/Projects/projects/test-nest/apps/backend/package.json
  ```
- Added generated-project `postinstall` patch infrastructure under `template/patches/`:
  - `patches/patch-nest-swagger.cjs` patches `@nestjs/swagger/dist/swagger-explorer.js` from `@nestjs/common/interfaces` to `@nestjs/common`.
  - This keeps Nest 12 alpha while working around the current `@nestjs/swagger@11.x` deep-import incompatibility.
  - The script is idempotent and resolves Swagger from `apps/backend/package.json` so it works with Bun's isolated linker.

### Known Gaps

- `cookiePrefix: 'class-digital-pins'` in `better-auth-config.service.ts` — needs de-branding.
- Auth module uses Handlebars template adapter for email — needs migration to React Email.
- Local generated-project verification currently requires patching `@hillbilly/rbac` from `"*"` to a local `link:` dependency until the package is published.
- Nest 12 alpha is intentionally kept; remove the Swagger postinstall patch once `@nestjs/swagger` publishes a Nest 12-compatible release.

### Done

- **`hillbilly sync` CLI** (Bun executable at `cli/`):
  - `sync push` — interactive OpenTUI React TUI (lazygit-style): file list, diff view, hunk-level staging (Space to stage, Enter to push)
  - `sync pull` — wraps `copier update`
  - **Scanner** (`scan.ts`): finds `/* @hillbilly-sync */` markers, diffs against template, parses hunks for line-level staging
  - **Push engine** (`push.ts`): applies staged hunks via `applyStagedHunks()`, writes files to template
  - **Marker system**: `/* @hillbilly-sync */` first-line comment on all template-owned files (125+ files annotated, `module/` excluded)
  - **Tested E2E** against test-nest: scan detects changes, TUI renders in virtual terminal, keyboard simulation stages hunks, push writes to template

### In Progress

- (none)

### Next

1. Reserve `@hillbilly` npm scope
2. Build `hillbilly` as standalone binary (`bun build --compile`) and add to template
3. Scaffold `packages/sdk/`
3. De-brand hardcoded strings (cookie prefix, etc.)
4. Migrate auth email from Handlebars to React Email
5. Wire example `apps/frontend` in template
6. Set up release-it per package
7. Publish reusable packages to npm (then update `"*"` to real semver ranges)

## Deferred

- `.release-it.json` test hook (`vp run test`) — will add when test scripts exist
- README rewrite — after template structure is solid
