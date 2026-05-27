# Hillbilly — Monorepo Template + Shared Packages

## Goal

A single monorepo that:

1. **Scaffolds new projects** via Copier with backend/frontend boilerplate pre-wired, including RBAC and UI as local workspace packages
2. **Syncs boilerplate changes** via Copier/template update flows + `hillbilly sync` CLI for reverse-sync

## Key Decisions

- **Repo name**: `hillbilly`
- **Package manager**: bun (1.3.14)
- **Template structure**: Separate `template/` subdirectory via `_subdirectory: template` in `copier.yaml`. Root is hillbilly's own tooling — no leakage into consumer projects.
- **Vite+ role**: One-time template source — initial scaffold committed into `template/` as static files. Copier handles copy + update. **No `vp create` during Copier runs**.
- **tsconfig**: Template-only via Copier (NOT a published npm package)
- **Format/Lint**: Vite+ (`vp check` via lint-staged), no biome
- **VCS hooks**: `.vite-hooks/` (commit-msg, pre-commit, prepare-commit-msg) using `npx` (Vite+ dispatcher sets PATH to `node_modules/.bin`)
- **Template drift**: Root configs and template configs are intentionally separate. Root = hillbilly dev tooling. Template = minimal consumer scaffold.
- **Nest boilerplate ownership**: Nest helper/boilerplate code lives directly in the generated backend template, not in a published `@hillbilly/nest` package. The package boundary caused ESM/Rspack/MikroORM/tsdown helper friction; template-owned source keeps runtime and metadata discovery simple.
- **Two-way boilerplate DX**: Use Copier for template → project updates. Add a Hillbilly reverse-sync helper later for project → template promotion, scoped to template-owned paths only.
- **RBAC is template-owned**: `@hillbilly/rbac` lives in `template/packages/rbac/` as a built ESM workspace package (no npm publish). Generated projects get it as a local workspace package via `workspace:*` protocol.
- **Backend build**: ESM output uses `nest build` for standard Nest compilation/assets, then `tsc-alias` for Node ESM path/full-extension rewrites, then a small post-build shim for Swagger plugin `require(...)` output.

## Template-owned packages (not published)

All packages ship inside the template as local workspace packages. None are published to npm.

| Package           | Location                       | Notes                                         |
| ----------------- | ------------------------------ | --------------------------------------------- |
| `@hillbilly/ui`   | `template/packages/ui/`        | Source-distributed UI library, no build       |
| `@hillbilly/rbac` | `template/packages/rbac/`      | Built ESM workspace package, no publish       |
| `@hillbilly/sdk`  | `template/packages/sdk/`       | OpenAPI-generated client, pre-generated types |
| Nest boilerplate  | `template/apps/backend/src/`   | Local Nest helpers, not a package             |
| `tsconfig`        | `template/packages/tsconfig/`  | Shared tsconfig presets (workspace pkg)       |
| `templates`       | `template/packages/templates/` | React Email templates                         |

## Template (Copier) — flat config files

- `.editorconfig`
- `.github/workflows/` — deploy templates with `{{ project_name }}`, `{{ gcp_project_id }}`
- `commitlint.config.ts`
- `.lintstagedrc.json`
- `.release-it.json` — project-level release (not package publishing)
- `.vite-hooks/`
- `tsconfig/` — base, nestjs, nextjs, react-library, start presets
- `package.json` — depends on `vite-plus` and standard dev tooling; all `@hillbilly/*` packages are local workspace packages.

## Scaffolded Project Structure

```
{{ project_name }}/
├── packages/
│   ├── rbac/         # Better Auth RBAC plugin (workspace package)
│   ├── sdk/          # OpenAPI-generated API client (workspace package)
│   ├── templates/    # React Email templates
│   ├── tsconfig/     # Copier-managed tsconfig presets (workspace package)
│   └── ui/           # shadcn-based UI component library (workspace package)
├── apps/
│   ├── backend/      # NestJS, local boilerplate source, imports @hillbilly/rbac
│   └── client/       # TanStack Start frontend, wired with @hillbilly/ui
├── .github/workflows/
├── package.json      # workspaces: ["packages/*", "apps/*"]
└── tsconfig.json     # extends ./packages/tsconfig/base.json
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

### Recent (Session: 2026-05-25)

- **Moved `@hillbilly/ui` into template** (`template/packages/ui/`). Source-distributed, no build step.
  - Updated UI package.json scripts to `vp check`/`vp fmt`/`vp lint` (Vite+ standard).
  - Moved `@hillbilly/rbac` into template (`template/packages/rbac/`).
  - Deleted `packages/` directory from root — no more root workspace packages.
  - Cleaned root `package.json` (removed workspaces, catalog kept as `"latest"` since no workspace packages exist to resolve `catalog:` protocol).
  - Updated root `knip.config.ts` and `AGENTS.md`.
- **Ported `apps/client` from pins**: TanStack Start frontend with auth, users, dashboard.
  - Renamed all `@pins/*` → `@hillbilly/*` imports (31 files).
  - Swapped `biome` scripts for `vp check`/`vp fmt`/`vp lint`.
  - Removed org routes/roles pages/middleware.
  - De-branded hardcoded strings (`Class Digital Pins` → `[[ project_name ]]`).
  - Created `package.json.jinja` with `workspace:*` deps for `@hillbilly/ui`, `@hillbilly/rbac`, `@hillbilly/sdk`.
  - Added `/* @hillbilly-sync */` marker to all 61 source files.
- **Scaffolded `@hillbilly/sdk`** (`template/packages/sdk/`):
  - Pre-generated types from `openapi.json` (130+ models, 7 API clients).
  - `openapitools.json` config for the generator (v7.18.0).
  - Backend regenerates via `openapi.config.ts` at startup in dev mode.
- **Backend build switched away from Rspack/SWC bundling**:
  - Uses `nest build && tsc-alias --resolve-full-paths --resolve-full-extension .js`.
  - `nest build` keeps Nest asset handling and Swagger plugin support.
  - `scripts/patch-swagger-plugin-output.mjs` converts Swagger plugin's `(await import(...))` → `require(...)` + adds `createRequire(import.meta.url)` shim, making the output valid under `"type": "module"`.
  - `nest-cli.json` now copies i18n JSON assets as well as `lib/openapi-description.md`.
  - `autoLoadEntities` is disabled because explicit MikroORM entity globs plus auto-load caused duplicate table metadata.
- **Runtime verification status**:
  - Generated `test-nest` builds and starts through Nest module initialization, MikroORM `TsMorphMetadataProvider` entity discovery, i18n asset loading, and route mapping.
  - Pulse endpoint (`GET /api/pulse`) is public via `@Auth({ public: true })`.
  - DB health check: up. Search-service health: down (expected — no NATS/Redis).
  - Registration works: `POST /api/auth/sign-up/email` → 200, user created.
  - RBAC sync completes with zero errors: `{ roles: { existing: 4 }, mappings: { synced: 15 } }`.
  - Remaining app-level issues: Better Auth warns it is using memory DB with `generateId: false`; login broken due to password hashing mismatch; OpenAPI client generation reports a Better Auth callback path parameter validation issue but does not block route mapping.

### NestJS Package Upgrade (Session: 2026-05-25)

- **All NestJS packages upgraded and pinned**. Removed `^` prefix on all alpha packages so sub-dependencies can't pull in older versions.
- **8 packages in root `overrides`** (alphabetic order):

| Package                    | Version          |
| -------------------------- | ---------------- |
| `@nestjs/cli`              | `12.0.0-alpha.6` |
| `@nestjs/common`           | `12.0.0-alpha.5` |
| `@nestjs/core`             | `12.0.0-alpha.5` |
| `@nestjs/microservices`    | `12.0.0-alpha.5` |
| `@nestjs/platform-express` | `12.0.0-alpha.5` |
| `@nestjs/schematics`       | `12.0.0-alpha.9` |
| `@nestjs/swagger`          | `12.0.0-alpha.2` |
| `@nestjs/testing`          | `12.0.0-alpha.5` |

- **Swagger 12 ESM migration**: `@nestjs/swagger@12.0.0-alpha.2` is fully ESM with proper exports. Removed `patch-nest-swagger.cjs` (was fixing `require("@nestjs/common/interfaces")` in CJS swagger-explorer — no longer needed).
- **Swagger plugin output**: Swagger 12 emits `(await import("..."))` in metadata factories (even without `esmCompatible: true`). The `await` inside non-`async` arrow functions causes `SyntaxError`. Updated `patch-swagger-plugin-output.mjs` to convert `(await import("X"))` → `require("X")` + `createRequire` shim.
- **`esmCompatible: true` tested and reverted**: the option is buggy in alpha.2 — generates the same broken `await` pattern. Our postbuild shim is the reliable approach until a stable `esmCompatible` mode ships.
- **Postinstall patches consolidated** (2 remaining, 1 removed):
  - `patch-better-auth-mikro-orm.cjs` — ManyToMany support (still needed)
  - `patch-nest-start.cjs` — runs `tsc-alias` + swagger shim during `nest start`/`nest start --watch` (still needed)
  - ~~`patch-nest-swagger.cjs`~~ — removed (swagger 12 ESM has proper exports)
- **tsconfig refactored**: Backend `tsconfig.json` now extends `@[[ project_name ]]/tsconfig/nestjs.json` instead of inlining all compiler options.
- **Cleaned stale deps**: Removed `handlebars` (replaced by React Email), `@react-email/*`, `react`, `react-dom` from backend (belong in `@[[ project_name ]]/templates` package only).
- **Dev mode**: `nest start` and `nest start --watch` both work via `patch-nest-start.cjs`.

## Verification Checklist

Run these against a generated project (e.g. `test-nest`):

### Install & Build

```bash
cd <project> && vp install
# Verify patches ran: "better-auth-mikro-orm already patched or not applicable"
#                     "Patched @nestjs/cli start action for ESM postbuild support."
cd apps/backend && vp run build
# Should produce ~175 .js files in dist/
```

### Dev Mode

```bash
# Kill any process on :3000 first
cd apps/backend && nest start
# Wait ~15s for MikroORM entity discovery + RBAC sync
curl -s http://localhost:3000/api/pulse
# → {"status":"error","info":{"database":{"status":"up"}},...}
# (503 is OK — search-service down without NATS)
```

### Auth Flow

```bash
# Register
curl -s -X POST http://localhost:3000/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","password":"Test1234!"}'
# → 200, user object with id, role: "USER"

# Login (BROKEN — password hashing mismatch)
# TODO: fix BetterAuth double-hashing
```

### RBAC

```bash
# Check startup logs for sync:
grep "RBAC.*Sync completed" <logfile>
# → { permissions: { created: 0, existing: 20 },
#     roles: { created: 0, existing: 4 },
#     mappings: { synced: 15, skipped: 0 } }
```

### Watch Mode

```bash
cd apps/backend && nest start --watch
# Touch a file → watch rebuild + restart in ~5s
# curl pulse → still responds
```

### Clean Rebuild

```bash
rm -rf apps/backend/dist apps/backend/tsconfig.build.tsbuildinfo
cd apps/backend && vp run build
# Should complete with 4 steps: prebuild, nest build, tsc-alias, patch-swagger
```

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
- Generated test project verification workflow:
  ```bash
  rm -rf /home/ares/Projects/projects/test-nest && copier copy /home/ares/Projects/hillbilly/. /home/ares/Projects/projects/test-nest --defaults --data-file /tmp/copier-data.json 2>&1 | tail -1
  ```
  (No more sed patching — RBAC is now a workspace package and resolves automatically.)
- Added generated-project `postinstall` patch infrastructure under `template/patches/`:
  - `patches/patch-nest-swagger.cjs` patches `@nestjs/swagger/dist/swagger-explorer.js` from `@nestjs/common/interfaces` to `@nestjs/common`.
  - This keeps Nest 12 alpha while working around the current `@nestjs/swagger@11.x` deep-import incompatibility.
  - The script is idempotent and resolves Swagger from `apps/backend/package.json` so it works with Bun's isolated linker.

### Known Gaps

- **Login broken**: BetterAuth double-hashes passwords or ignores custom `hash()`/`verify()` in `emailAndPassword.password`. Registration stores a hash that doesn't match on login compare.
- **Better Auth memory DB warning**: `[better-auth] Misconfiguration detected. You are using the memory DB with generateId: false.` — investigate whether this is cosmetic or affects `generateId`.
- **OpenAPI generation warning**: Better Auth callback path parameter validation issue — non-blocking, just a spec warning.
- **Swagger plugin ESM patch**: `patch-swagger-plugin-output.mjs` will be removable when a stable `esmCompatible` mode ships in `@nestjs/swagger`.
- **Nest CLI ESM patch**: `patch-nest-start.cjs` runs `tsc-alias` post-compilation. Removable if Nest CLI adds native postbuild hook support or switches to a bundler that resolves path aliases.

### Done

- **`hillbilly sync` CLI** (Bun executable at `cli/`):
  - `sync push` — interactive OpenTUI React TUI (lazygit-style): file list, diff view, hunk-level staging (Space to stage, Enter to push)
  - `sync pull` — wraps `copier update`
  - **Scanner** (`scan.ts`): finds `/* @hillbilly-sync */` markers, diffs against template, parses hunks for line-level staging
  - **Push engine** (`push.ts`): applies staged hunks via `applyStagedHunks()`, writes files to template
  - **Marker system**: `/* @hillbilly-sync */` first-line comment on all template-owned files (125+ files annotated, `module/` excluded)
  - **Tested E2E** against test-nest: scan detects changes, TUI renders in virtual terminal, keyboard simulation stages hunks, push writes to template
  - **Package upgrades** (2026-05-25): `@opentui/core` 0.1→0.2, `@opentui/react` 0.1→0.2, `commander` 13→14, `diff` 8→9, `vitest` 2→4, `react` 19.0→19.2, `@types/node` → 25, added `@types/bun` (pre-existing missing type)
  - **DX**: `bin` field for `hillbilly` command, `build` script (`bun build --compile`), standalone binary rebuilt (92 MB), `cli/README.md` with full usage guide
  - **Approved next DX direction**: generated projects should run `hillbilly sync push` from inside the project and resolve a local template repo via explicit CLI option, project `.hillbilly.yml`, global config, then Copier answers fallback. PR automation is deferred until the local repo loop is solid.
  - **Config workflow implemented**: `sync push --template`, project `hillbilly.yml`, Copier fallback, `config set-template`, and `config doctor`.
  - **Sync ownership moved to manifest**: `hillbilly.yml` sync section is now the source of truth with `tracked`/`untracked` tombstones. Inline `@hillbilly-sync` comments and scanning were removed.
  - **Config consolidation**: three files (`.hillbilly.yml`, `.hillbilly-sync.yml`, `.copier-answers.yml`) merged into `hillbilly.yml`. Global config removed. `pull` command extracts/merges Copier answers via transient `.copier-answers.yml`.

### In Progress

- **Config file consolidation** (Session: 2026-05-27):
  - Merged `.hillbilly.yml`, `.hillbilly-sync.yml`, and `.copier-answers.yml` into a single `hillbilly.yml` per project.
  - Removed global config (`~/.config/hillbilly/config.yml`) — all settings now per-project.
  - `hillbilly.yml` stores: Copier answers (flat keys), template config (`templateRepo`, `templateSubdir`), TUI settings (`tui.*`), and sync manifest (`sync.files`).
  - `.copier-answers.yml` is now transient: `hillbilly sync pull` extracts answers to it, runs copier, merges new answers back, then deletes it.
  - `.copier-answers.yml` added to `.gitignore` and scanner exclusions.
  - SDK exclusion removed from scanner.
  - All template files converted to `.jinja` (623 files); only `bin/`, images, and `packages/sdk/src/docs/*.md` left as plain files.
  - 4 shell scripts with bash `[[ ]]` conditionals wrapped in `[% raw %]...[% endraw %]` blocks.

### Recently Completed (Session: 2026-05-27)

- **Sync markers added to all template TS/JS files** (416 files, up from 197):
  - Previously excluded `module/` directories (auth, user) now included
  - RBAC source + tests, UI components, templates, root configs, patches all annotated
  - OpenAPI-generated SDK files excluded (auto-generated)
  - Scanner updated to handle shebang files (checks line 2 if line 1 is `#!`)
  - Root lint-staged config: template files skip `vp lint` (no `node_modules`)
- **TUI theme support**: 33 opencode themes bundled as static palette data
  - `t` key cycles through themes, preserved across refreshes
  - Configurable via `themeName` in State
  - All hardcoded color constants replaced with dynamic palette lookups
- **TUI refresh keybinding**: `r` re-scans the project and refreshes the diff view
  - Clears staged hunks to prevent staging stale diffs
  - Shows status message with refreshed file count

### Upgrade Summary (2026-05-25)

All stable packages across the template upgraded to latest. Code fixes applied where needed. Skipped: `better-auth-mikro-orm` (kept `1.0.0-next.2`). CLI packages upgraded in a later pass (see below).

| Step | Area            | Key changes                                                                                                        | Code fixes                                                     |
| ---- | --------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1    | Toolchain       | commitlint 19→21, lint-staged 15→17, release-it 19→20, knip 5→6                                                    | None needed                                                    |
| 2    | @types/node     | ^22.x → ^24.0.0 (5 packages)                                                                                       | None needed                                                    |
| 3    | Backend devDeps | vitest 3→4, swc 1.11→1.15, dotenv 16→17, inquirer 12→13, types bump                                                | None needed                                                    |
| 4    | Backend deps    | better-auth 1.6.0→1.6.11, uuid 11→14, zod 4.1→4.4, OTEL 0.205→0.218, removed `better-call` (unused transitive dep) | None needed                                                    |
| 5    | Client          | vite 7→8, TanStack 1.154→1.170, lucide-react 0.x→1.x, react-hook-form 7.56→7.76, tailwind 4.0→4.3, jsdom 27→29     | None needed                                                    |
| 6    | UI              | react-day-picker 9→10, recharts 2→3, motion 12.7→12.40, react-aria 3.39→3.48, lucide-react 0.477→1.16              | `initialFocus` → `autoFocus` (2 occurrences in datepicker.tsx) |
| 7    | Templates + SDK | @react-email/\* bump, react-email 6.1→6.3, axios 1.8→1.16, openapi-generator-cli 2.19→2.34                         | None needed                                                    |

**Risk notes:**

- vite 7→8, vitest 3→4, uuid 11→14, recharts 2→3, react-day-picker 9→10 — all major bumps, configs verified compatible
- `better-call` removed from direct deps — never imported, already pulled transitively by better-auth
- lucide-react icon names may have changed; will surface as TS errors at build time
- recharts v3 internal state changes; chart.tsx uses basic primitives, should be fine

### Next

1. Fix BetterAuth password hashing mismatch (login broken)
2. Run `vp install` + `vp run build` on test-nest to verify all upgrades
3. ~~Build `hillbilly` as standalone binary (`bun build --compile`) and add to template~~ DONE (binary rebuilt, `bin` + `build` script added, `cli/README.md` written)
4. Add missing pages (settings, profile, etc.) to client template

#### NestJS v12 Alphas (NO UPDATE — all at latest)

| Package                    | Pinned           | Latest Alpha     |
| -------------------------- | ---------------- | ---------------- |
| `@nestjs/cli`              | `12.0.0-alpha.6` | `12.0.0-alpha.6` |
| `@nestjs/common`           | `12.0.0-alpha.5` | `12.0.0-alpha.5` |
| `@nestjs/core`             | `12.0.0-alpha.5` | `12.0.0-alpha.5` |
| `@nestjs/microservices`    | `12.0.0-alpha.5` | `12.0.0-alpha.5` |
| `@nestjs/platform-express` | `12.0.0-alpha.5` | `12.0.0-alpha.5` |
| `@nestjs/schematics`       | `12.0.0-alpha.9` | `12.0.0-alpha.9` |
| `@nestjs/swagger`          | `12.0.0-alpha.2` | `12.0.0-alpha.2` |
| `@nestjs/testing`          | `12.0.0-alpha.5` | `12.0.0-alpha.5` |

#### 1. Toolchain — Root + Template Root (`package.json` / `template/package.json.jinja`)

| Package                              | Current   | Latest   | Risk         |
| ------------------------------------ | --------- | -------- | ------------ |
| `@commitlint/cli`                    | `^19.8.0` | `21.0.1` | **MAJOR** ⨯2 |
| `@commitlint/config-conventional`    | `^19.8.0` | `21.0.1` | **MAJOR**    |
| `@release-it/conventional-changelog` | `^10.0.0` | `11.0.0` | **MAJOR**    |
| `knip`                               | `^5.50.0` | `6.14.2` | **MAJOR**    |
| `lint-staged`                        | `^15.5.2` | `17.0.5` | **MAJOR** ⨯2 |
| `release-it`                         | `^19.0.2` | `20.0.1` | **MAJOR**    |
| `commitizen`                         | `^4.3.1`  | 4.3.1    | -            |
| `cz-conventional-changelog`          | `^3.3.0`  | 3.3.0    | -            |
| `vite-plus`                          | `latest`  | latest   | -            |

#### 2. CLI (`cli/package.json`) — SKIP for now

#### 3. Backend (`template/apps/backend/package.json.jinja`)

**Dependencies:**
| Package | Current | Latest | Risk |
| ------------------------------------ | ---------------- | --------------- | ------------ |
| `better-auth` | `^1.6.0` | `1.6.11` | patch |
| `better-auth-mikro-orm` | `1.0.0-next.2` | KEEP | - |
| `better-call` | `^1.0.13` | `2.0.3` | **MAJOR** |
| `@thallesp/nestjs-better-auth` | `^2.2.0` | `2.6.0` | minor |
| `@nestjs/throttler` | `^6.4.0` | `6.5.0` | minor |
| `@nestjs-modules/mailer` | `^2.0.2` | `2.3.6` | minor |
| `nestjs-cls` | `^6.0.0` | `6.2.0` | minor |
| `nestjs-i18n` | `^10.5.1` | `10.8.4` | minor |
| `nest-commander` | `^3.17.0` | `3.20.1` | minor |
| `bullmq` | `^5.41.1` | `5.77.3` | minor |
| `@scalar/nestjs-api-reference` | `^1.0.13` | `1.1.19` | minor |
| `axios` | `^1.9.0` | `1.16.1` | minor |
| `uuid` | `^11.1.0` | `14.0.0` | **MAJOR** ⨯3 |
| `zod` | `^4.1.13` | `4.4.3` | minor |
| `class-validator` | `^0.14.2` | `0.15.1` | minor |
| `mime-types` | `^3.0.1` | `3.0.2` | patch |
| `compression` | `^1.8.0` | `1.8.1` | patch |
| `helmet` | `^8.1.0` | `8.2.0` | minor |
| `ioredis` | `^5.6.1` | `5.10.1` | minor |
| `libphonenumber-js` | `^1.12.8` | `1.13.3` | minor |
| `lodash` | `^4.17.21` | `4.18.1` | minor |
| `morgan` | `^1.10.0` | `1.10.1` | patch |
| `slugify` | `^1.6.6` | `1.6.9` | patch |
| `@mikro-orm/*` (all 7.x) | `^7.1.0/^7.1.1` | `7.1.1` | patch |
| `@mikro-orm/nestjs` | `^7.0.0` | `7.0.2` | patch |
| **OpenTelemetry** (all `0.205.x`) | `0.205.x` | `0.218.x` | minor bump |
| | | `sdk-trace-node: 2.7.1` | |

No change: `bcrypt`, `cache-manager-redis-store`, `class-transformer`, `openapi-merge`, `parse-duration`, `reflect-metadata`, `rxjs`, `source-map-support`, `swagger-ui-express`, `tslib`, `twilio`, `@nestjs/bull`, `@nestjs/bullmq`, `@nestjs/config`, `@nestjs/cqrs`, `@nestjs/terminus`, `@abbas_srour/nest-openapi-tools`.

**DevDependencies:**
| Package | Current | Latest | Risk |
| ------------------------------------- | -------- | ------------ | ---------------- |
| `vitest` | `^3.1.4` | `4.1.7` | **MAJOR** |
| `@vitest/coverage-v8` | `^3.1.4` | `4.1.7` | **MAJOR** |
| `@vitest/ui` | `^3.2.4` | `4.1.7` | **MAJOR** |
| `@swc/core` | `^1.11.29` | `1.15.40` | minor (big jump) |
| `@swc/cli` | `^0.7.7` | `0.8.1` | minor |
| `@faker-js/faker` | `^10.2.0` | `10.4.0` | minor |
| `dotenv` | `^16.5.0` | `17.4.2` | **MAJOR** |
| `@openapitools/openapi-generator-cli` | `^2.27.0` | `2.34.0` | minor |
| `supertest` | `^7.1.1` | `7.2.2` | minor |
| `inquirer` | `^12.6.3` | `13.4.3` | **MAJOR** |
| `cross-env` | `^7.0.3` | `10.1.0` | **MAJOR** |
| `tsc-alias` | `^1.8.16` | `1.8.17` | patch |
| `unplugin-swc` | `^1.5.4` | `1.5.9` | patch |
| `vite-tsconfig-paths` | `^5.1.4` | `6.1.1` | **MAJOR** |
| `@better-auth/cli` | `^1.4.10` | `1.4.21` | patch |
| `@types/node` | `^22.10.2` | `24.x` | types bump |
| `@types/bcrypt` | `^5.0.2` | `6.0.0` | **MAJOR** |
| `@types/express` | `^5.0.2` | `5.0.6` | patch |
| `@types/lodash` | `^4.17.17` | `4.17.24` | patch |
| `@types/supertest` | `^6.0.3` | `7.2.0` | **MAJOR** |
| `@types/uuid` | `^10.0.0` | `11.0.0` | **MAJOR** |

No change: `@mikro-orm/sqlite`, `ts-node`, `tsconfig-paths`, `@types/compression`, `@types/morgan`.

#### 4. Client (`template/apps/client/package.json.jinja`)

| Package                       | Current          | Latest          | Risk               |
| ----------------------------- | ---------------- | --------------- | ------------------ |
| `react` / `react-dom`         | `^19.2.0`        | `19.2.6`        | patch              |
| `react-hook-form`             | `7.56.0`         | `7.76.1`        | minor              |
| `tailwindcss`                 | `^4.0.6`         | `4.3.0`         | minor              |
| `@tailwindcss/vite`           | `^4.0.6`         | `4.3.0`         | minor              |
| `vite`                        | `^7.1.7`         | `8.0.14`        | **MAJOR**          |
| `vitest`                      | `^3.0.5`         | `4.1.7`         | **MAJOR**          |
| `zod`                         | `^4.2.1`         | `4.4.3`         | minor              |
| `better-auth` (client)        | `^1.4.12`        | `1.6.11`        | minor              |
| `axios`                       | `^1.8.4`         | `1.16.1`        | minor              |
| `@tanstack/*` (all `1.154.x`) | `1.154.x`        | `1.168-1.171.x` | minor              |
| `lucide-react`                | `^0.561.0`       | `1.16.0`        | **MAJOR** (v0→v1)  |
| `react-hot-toast`             | `^2.5.2`         | `2.6.0`         | minor              |
| `tailwind-merge`              | `^3.0.2`         | `3.6.0`         | minor              |
| `@tabler/icons-react`         | `^3.36.1`        | `3.44.0`        | minor              |
| `@t3-oss/env-core`            | `^0.13.8`        | `0.13.11`       | patch              |
| `@hookform/resolvers`         | `^5.2.2`         | `5.4.0`         | minor              |
| `@bprogress/core`             | `^1.0.2`         | `1.3.4`         | minor              |
| `@bprogress/react`            | `^1.0.2`         | `1.2.7`         | minor              |
| `jsdom`                       | `^27.0.0`        | `29.1.1`        | **MAJOR** ⨯2       |
| `web-vitals`                  | `^5.1.0`         | `5.2.0`         | minor              |
| `@vitejs/plugin-react`        | `^5.0.4`         | `6.0.2`         | **MAJOR**          |
| `@inlang/paraglide-js`        | `^2.8.0`         | `2.18.1`        | minor              |
| `@testing-library/react`      | `^16.2.0`        | `16.3.2`        | patch              |
| `tw-animate-css`              | `^1.3.6`         | `1.4.0`         | minor              |
| `nitro`                       | `^3.0.1-alpha.2` | `3.0-beta`      | pre-release (KEEP) |

#### 5. UI (`template/packages/ui/package.json.jinja`)

| Package                     | Current    | Latest    | Risk              |
| --------------------------- | ---------- | --------- | ----------------- |
| `react` / `react-dom`       | `^19.0.0`  | `19.2.6`  | minor             |
| `react-hook-form`           | `7.56.0`   | `7.76.1`  | minor             |
| `tailwindcss`               | `^4`       | `4.3.0`   | minor             |
| `@tailwindcss/postcss`      | `^4`       | `4.3.0`   | minor             |
| `zod`                       | `^4.2.1`   | `4.4.3`   | minor             |
| `motion`                    | `^12.7.4`  | `12.40.0` | minor (big jump)  |
| `react-aria`                | `^3.39.0`  | `3.48.0`  | minor             |
| `react-day-picker`          | `9.10.0`   | `10.0.1`  | **MAJOR**         |
| `recharts`                  | `^2.15.4`  | `3.8.1`   | **MAJOR**         |
| `date-fns`                  | `^4.1.0`   | `4.3.0`   | minor             |
| `zustand`                   | `^5.0.3`   | `5.0.13`  | patch             |
| `lucide-react` (devDep)     | `0.477.0`  | `1.16.0`  | **MAJOR** (v0→v1) |
| `@tanstack/react-pacer`     | `^0.19.3`  | `0.22.1`  | minor             |
| `@tanstack/react-virtual`   | `^3.13.12` | `3.13.25` | patch             |
| `tw-animate-css`            | `^1.2.5`   | `1.4.0`   | minor             |
| `@turbo/gen`                | `^2.4.2`   | `2.9.14`  | minor             |
| `@radix-ui/react-avatar`    | `^1.1.10`  | `1.1.11`  | patch             |
| `@radix-ui/react-label`     | `^2.1.7`   | `2.1.8`   | patch             |
| `@radix-ui/react-separator` | `^1.1.7`   | `1.1.8`   | patch             |
| `@radix-ui/react-slot`      | `^1.2.3`   | `1.2.4`   | patch             |

No change: rest of `@radix-ui/*`, `embla-carousel-react`, `sonner`, `vaul`, `cmdk`, `@tanstack/react-table`, `@uidotdev/usehooks`, `better-themes`, `class-variance-authority`, `clsx`.

#### 6. Templates (`template/packages/templates/package.json.jinja`)

| Package                   | Current   | Latest   | Risk  |
| ------------------------- | --------- | -------- | ----- |
| `@react-email/components` | `^1.0.9`  | `1.0.12` | patch |
| `@react-email/render`     | `^2.0.4`  | `2.0.8`  | patch |
| `react-email`             | `^6.1.3`  | `6.3.3`  | minor |
| `react` / `react-dom`     | `^19.2.4` | `19.2.6` | patch |

#### 7. SDK (`template/packages/sdk/package.json.jinja`)

| Package                               | Current   | Latest   | Risk  |
| ------------------------------------- | --------- | -------- | ----- |
| `axios`                               | `^1.8.4`  | `1.16.1` | minor |
| `@openapitools/openapi-generator-cli` | `^2.19.1` | `2.34.0` | minor |

#### 8. RBAC (`template/packages/rbac/package.json.jinja`)

No updates (peer/better-auth + zod, dev/types-node + vitest — covered elsewhere).

### Upgrade Order

1. **Toolchain** (root + template root) — commitlint, lint-staged, release-it, knip
2. **@types/node → 24** (all packages)
3. **Backend devDeps** — vitest, swc, types, dotenv, inquirer, cross-env, etc.
4. **Backend deps** — better-auth, better-call, uuid, zod, OpenTelemetry, etc.
5. **Client** — vite, TanStack, lucide-react, react-hook-form, tailwind, etc.
6. **UI** — recharts, react-day-picker, motion, react-aria, etc.
7. **Templates + SDK** — react-email, axios

### Next

1. Fix BetterAuth password hashing mismatch (login broken)
2. Investigate/fix Better Auth memory DB warning
3. ~~Build `hillbilly` as standalone binary (`bun build --compile`) and add to template~~ DONE
4. ~~Config consolidation (hillbilly.yml merges all three files)~~ DONE
5. Add missing pages (settings, profile, etc.) to client template

## Deferred

- `.release-it.json` test hook (`vp run test`) — will add when test scripts exist
- README rewrite — after template structure is solid
