<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project uses Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, typecheck and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Monorepo Layout

```
.
├── apps/
│   └── backend/       ← NestJS backend (CJS, TS7)
├── packages/
│   ├── templates/     ← React Email templates (not published)
│   └── tsconfig/      ← shared tsconfig presets
├── package.json       ← root workspace config
├── bunfig.toml        ← isolated linker
├── vite.config.ts     ← Vite+ task runner & code review tasks
├── tsconfig.json      ← root TS config
├── commitlint.config.ts
├── .lintstagedrc.json
├── .release-it.json
├── knip.config.ts     ← dead code detection
└── AGENTS.md
```

## Quick Commands

| What                      | Command                              |
| ------------------------- | ------------------------------------ |
| Install deps              | `vp install`                         |
| Run all checks            | `vp check` (or `vp check --fix`)     |
| Run all tests             | `vp run -r test`                     |
| Run a single test file    | `vitest run <path>` from package dir |
| Build all packages/apps   | `vp run -r build`                    |
| Dev mode                  | `vp run`                             |
| Dead code / unused deps   | `knip`                               |
| Release                   | `release-it`                         |

## Package Manager

Bun with isolated linker (`bunfig.toml`). **Never use npm or pnpm.**

## Backend (apps/backend)

- **Runtime**: NestJS v12, TypeScript 7 (`@typescript/native-preview`), CJS output.
- **Email**: React Email templates in `packages/templates/`, compiled at build time.
- **TypeScript**: Uses native path rewriting via TS7 — no `tsconfig-paths` or `tsc-alias`.
- **Path aliases**: `@/*`, `@module/*`, `@config/*`, `@lib/*`, `@constant/*` map to `./src/*` variants.
- **Backend boilerplate**: Nest helpers live as local source under `apps/backend/src` (middleware, guards, decorators, abstract classes, package modules). Do not depend on `@hillbilly/nest`.
- **Auth**: Better Auth with MikroORM adapter, imported from `@hillbilly/rbac` for permissions.
- **DB**: MikroORM with PostgreSQL driver.
