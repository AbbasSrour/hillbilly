# Hillbilly — Monorepo Template + Shared Packages

## Goal

A single monorepo that:

1. **Publishes shared code packages** to `@hillbilly/*` on npm (`ui`, `nest`, `rbac`, `sdk`)
2. **Scaffolds new projects** via Copier with backend/frontend pre-wired with plugins
3. **Syncs config changes** via `copier update` to existing projects

## Key Decisions

- **Repo name**: `hillbilly`
- **Package manager**: bun (1.3.14)
- **Scope**: `@hillbilly` on npm
- **Template structure**: Separate `template/` subdirectory via `_subdirectory: template` in `copier.yaml`. Root is hillbilly's own tooling — no leakage into consumer projects.
- **Vite+ role**: One-time template source — initial scaffold committed into `template/` as static files. Copier handles copy + update. **No `vp create` during Copier runs**.
- **tsconfig**: Template-only via Copier (NOT a published npm package)
- **Package publishing**: release-it per package. Each `packages/*/` has its own `.release-it.json`. Independent versions, per-package changelog.
- **Format/Lint**: Vite+ (`vp check` via lint-staged), no biome
- **VCS hooks**: `.vite-hooks/` (commit-msg, pre-commit, prepare-commit-msg) using `npx` (Vite+ dispatcher sets PATH to `node_modules/.bin`)
- **Template drift**: Root configs and template configs are intentionally separate. Root = hillbilly dev tooling. Template = minimal consumer scaffold.

## Packages (published to npm)

| Package           | Status     | Publishing             |
| ----------------- | ---------- | ---------------------- |
| `@hillbilly/ui`   | ⬜ planned | release-it per package |
| `@hillbilly/nest` | ⬜ planned | release-it per package |
| `@hillbilly/rbac` | ⬜ planned | release-it per package |
| `@hillbilly/sdk`  | ⬜ planned | release-it per package |

## Template (Copier) — flat config files

- `.editorconfig`
- `.github/workflows/` — deploy templates with `{{ project_name }}`, `{{ gcp_project_id }}`
- `commitlint.config.ts`
- `.lintstagedrc.json`
- `.release-it.json` — project-level release (not package publishing)
- `.vite-hooks/`
- `tsconfig/` — base, nestjs, nextjs, react-library, start presets
- `package.json` — depends on `@hillbilly/*` from npm (NOT workspace protocol)

## Scaffolded Project Structure

```
{{ project_name }}/
├── packages/
│   └── tsconfig/    # Copier-managed tsconfig presets (workspace package)
├── apps/
│   ├── backend/     # NestJS, wired with @hillbilly/nest + @hillbilly/rbac
│   └── web/         # Frontend, wired with @hillbilly/ui
├── .github/workflows/
├── package.json     # depends on @hillbilly/* packages
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

### Next

1. Reserve `@hillbilly` npm scope
2. Scaffold packages: `packages/ui/`, `packages/nest/`, `packages/rbac/`, `packages/sdk/`
3. Wire example `apps/backend` + `apps/web` in template (with Dockerfiles)
4. Set up release-it per package
5. Publish packages to npm (then update `"*"` to real semver ranges)

## Deferred

- `.release-it.json` test hook (`vp run test`) — will add when test scripts exist
- README rewrite — after template structure is solid
