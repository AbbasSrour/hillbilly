<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Hillbilly — Copier Template

## Quick commands

| What                          | Command                          |
| ----------------------------- | -------------------------------- |
| Install deps                  | `bun install` (NOT `npm`)        |
| Format, lint, typecheck       | `vp check` (or `vp check --fix`) |
| Run all tests                 | `vp test` or `vp run -r test`    |
| Run a single test file        | `vitest run <path>`              |
| Dead code / unused deps check | `knip`                           |
| Release (root-level)          | `bun release`                    |

## Package manager

Bun with isolated linker (`bunfig.toml`). **Never use npm or pnpm.** The Node version requirement is `>=22.12.0`.

## Repository layout

```
hillbilly/
├── src/           ← hillbilly sync CLI source
├── tests/         ← CLI tests
├── template/      ← Copier template for scaffolding new projects
│   ├── apps/
│   │   ├── backend/  ← NestJS backend
│   │   └── client/   ← TanStack Start frontend
│   ├── packages/
│   │   ├── rbac/      ← @hillbilly/rbac (built ESM, shipped in template)
│   │   ├── tsconfig/  ← tsconfig presets (base, nestjs, nextjs, react-library, start)
│   │   ├── templates/ ← React Email templates
│   │   └── ui/        ← @hillbilly/ui (source-distributed, shipped in template)
│   └── bin/           ← hillbilly binary + runtime assets
└── plans/         ← planning docs (hillbilly.md is the canonical plan)
```

All packages are template-owned — none are published to npm. `template/` is NOT a workspace — it's a Copier source.

## Template is separate from root

Root configs (`vite.config.ts`, `.release-it.json`, etc.) are hillbilly's own dev tooling. The `template/` directory is a Copier source with its own minimal configs — root and template drift intentionally. Copier uses `[[ ]]` delimiters in template files (not `{{ }}`) because of GitHub Actions `${{ }}` conflicts.

## RBAC package (@hillbilly/rbac)

- **Location**: `template/packages/rbac/` — ships as a workspace package in generated projects.
- **Type**: `module` in package.json, ESM only.
- **Build**: `tsgo -p tsconfig.json && tsc-alias ...` produces `dist/` output. Exports point to `dist/`.
- **Entry points**: `client.ts` and `server.ts` at package root re-export from `src/client` / `src/server`. The main `src/index.ts` exports shared types/utilities only.
- **Tests**: Unit (`*.spec.ts`), integration (`*.integration-spec.ts`), e2e (`*.e2e-spec.ts`). Run from the package directory.
- **Vitest**: Config in `vitest.config.ts` with 30s timeouts.

## UI package (@hillbilly/ui)

- **Location**: `template/packages/ui/` — ships as a workspace package in generated projects.
- **Type**: `module`, source-distributed (exports map to `src/` directly, no build step).
- **shadcn**: Components use `components.json` with aliases like `@hillbilly/ui/components`. To add shadcn components: `pnpm dlx shadcn@latest` from the UI package directory.
- **Tailwind**: v4 with `@tailwindcss/postcss`. PostCSS config at `postcss.config.mjs`.

## Commit & release

- **Commits**: Conventional Commits enforced by commitlint. Use `bun commit` for the commitizen prompt.
- **Hooks**: `.vite-hooks/` runs `vp staged` on pre-commit and commitlint on commit-msg. Uses `npx` (Vite+ sets PATH).
- **Release**: `release-it` with conventional-changelog. Requires clean working dir, clean `main` branch, and runs `vp check && vp run test` before init. Root release does NOT publish to npm.

## Knip (dead code detection)

Configured in `knip.config.ts` — entry is `src/index.ts`, ignores generated files like `**/routeTree.gen.ts`.
