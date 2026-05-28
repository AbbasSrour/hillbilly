# Hillbilly Sync CLI

The `hillbilly` binary is a Copier-template sync tool. It scaffolds projects (via Copier),
pushes local boilerplate changes back to the template, and pulls upstream template updates.

This document is the canonical reference for the current architecture and the in-flight
**Sync v2 — Bidirectional TUI** work.

---

## Current architecture

### Source layout

```
src/
├── config.ts     Config + merged-file I/O + template resolution
├── exclude.ts    Shared file walker and exclusion rules
├── helpers.ts    Path expansion, fish completions
├── index.ts      Commander entry, all CLI commands
├── manifest.ts   Sync manifest (the `sync.files` section of hillbilly.yml)
├── push.ts       Apply staged hunks to template files
├── scan.ts       Diff project against template, build SyncFile[] + hunks
├── theme.ts      33 OpenCode themes for the TUI
└── tui.tsx       OpenTUI/React interactive sync UI
tests/
├── config.spec.ts
├── index.spec.ts
├── manifest.spec.ts
├── push.spec.ts
├── scan.spec.ts
└── tui.spec.ts
scripts/
└── build.ts      Bun.build entry with $bunfs worker embedding
```

All sync state lives in a single file: `hillbilly.yml` at the project root.
That file is a merged YAML document containing three logical sections:

| Section          | Owner     | Example keys                                  |
| ---------------- | --------- | --------------------------------------------- |
| Copier answers   | Copier    | `project_name`, `_src_path`, `_commit`        |
| Hillbilly config | hillbilly | `templateRepo`, `templateSubdir`, `tui`       |
| Sync manifest    | hillbilly | `sync.version`, `sync.files[].path`, `.state` |

`KNOWN_HILLBILLY_ROOT_KEYS = {"templateRepo", "templateSubdir", "tui", "sync"}` distinguishes
hillbilly-owned keys from Copier answers in the merged file.

### Schema — `HillbillyConfig`

```ts
interface HillbillyConfig {
  templateRepo?: string;
  templateSubdir?: string;
  tui?: {
    theme?: string;
    diffView?: "unified" | "split";
    diffLineColors?: boolean;
    diffSigns?: boolean;
    showLineNumbers?: boolean;
    diffWrap?: boolean;
    lastDirection?: "push" | "pull"; // sync v2
  };
}
```

### Command surface

| Command                                      | Behaviour                                               |
| -------------------------------------------- | ------------------------------------------------------- |
| `hillbilly sync`                             | TUI bidirectional (push/pull, remembers last direction) |
| `hillbilly sync push [--yes]`                | CLI-only: scan + summary + confirm + push               |
| `hillbilly sync pull [--vcs-ref] [--recopy]` | Wraps `copier update` / `copier recopy`                 |
| `hillbilly sync mark <files...>`             | Track project files in the sync manifest                |
| `hillbilly sync unmark <files...>`           | Untrack (keep tombstones)                               |
| `hillbilly sync list`                        | List entries in the manifest                            |
| `hillbilly config set-template`              | Persist `templateRepo` and `templateSubdir`             |
| `hillbilly doctor`                           | Template resolution, copier check, orphan tempdir sweep |
| `hillbilly upgrade`                          | Copy the latest `hillbilly` binary from the template    |
| `hillbilly completion <shell>`               | Print shell completions (fish only today)               |

### Module graph

```
index.ts ─┬─► scan.ts ──► exclude.ts
          ├─► push.ts
          ├─► pull.ts (sync v2)
          ├─► config.ts ──► merged-file helpers
          ├─► manifest.ts ──► merged-file helpers
          └─► tui.tsx ──► theme.ts
                       ├─► scan.ts / push.ts / pull.ts (sync v2)
                       └─► config.ts (read/write tui prefs)
```

### TUI keybindings

| Key                   | Action                                      |
| --------------------- | ------------------------------------------- |
| `j` / `k`             | Navigate files / hunks                      |
| `gg` / `G`            | Jump to first / last                        |
| `Space`               | Stage current file or hunk                  |
| `a`                   | Stage all hunks                             |
| `Tab`                 | Switch panel (files ↔ diff)                 |
| `Enter`               | Apply staged hunks (push or pull)           |
| `r`                   | Refresh scan                                |
| `p`                   | Toggle direction (push ↔ pull) — sync v2    |
| `m`                   | Mark files                                  |
| `u`                   | Unmark / untrack selected                   |
| `d` (twice)           | Delete / prune stale file                   |
| `/`                   | Filter by path                              |
| `f`                   | Filter by status                            |
| `t`                   | Theme picker                                |
| `s`                   | Toggle unified / split diff                 |
| `b` / `z` / `l` / `w` | Toggle colors / signs / line numbers / wrap |
| `?`                   | Help overlay                                |
| `q` / `Esc`           | Quit / close picker                         |

### Build

`scripts/build.ts` uses `Bun.build` with two entrypoints (CLI + parser worker) and a
`$bunfs/root/...` define so OpenTUI's tree-sitter client locates the worker inside the
compiled binary. The output is `dist/hillbilly`; the build then copies it into
`template/bin/hillbilly` so generated projects ship with the latest binary.

---

## Sync v2 — Bidirectional TUI

### Goal

Replace the push-only TUI with a single bidirectional UI that handles both pushing local
changes back to the template and pulling template changes into the project. The pull side
delegates the actual merge to Copier (which has a real 3-way merge, handles Jinja, runs
migrations) and lets the user pick which resulting hunks to keep.

### Architecture decision: Option D

For pull mode we ship out to Copier rather than reimplement merge logic:

1. Copy the project into a tempdir under `os.tmpdir()/hillbilly-pull-<random>`.
2. Run `copier update --defaults --conflict inline --quiet <tempdir>` there.
3. Diff the project against the tempdir using the same hunk machinery as push.
4. Present the diff in the TUI; user picks hunks; Enter copies them back.
5. Clean up the tempdir on exit (best-effort + `hillbilly doctor` sweep).

This keeps Copier as the source of truth for merge correctness — Jinja, migrations,
`_commit` baseline, conflict markers — while still giving the user fine-grained control
over what lands.

### State machine

```
            ┌──────────────────┐    p (with checks)    ┌──────────────────┐
   start ──►│   push (default) │ ────────────────────► │  pull (prepared) │
            └────────┬─────────┘                       └────────┬─────────┘
                     │              p (rescan)                  │
                     │ ◄────────────────────────────────────────┘
                     │ Enter ► pushChanges()                    │
                     ▼                                          ▼
                  success                                  Enter ► pullChanges()
```

Switching to pull triggers, in order:

1. Read `_commit` from `hillbilly.yml` Copier answers. If missing → banner, stay in push.
2. Probe `copier --version`. If missing → banner, stay in push.
3. Check `<templateRoot>/copier.yml` (or `.yaml`) for `_migrations`. If present → warning modal; user confirms.
4. Copy project → tempdir (filtered via `EXCLUDE_DIRS`).
5. Spawn `copier update --defaults --conflict inline --quiet <tempdir>`.
6. Re-scan: diff project vs tempdir; tag files with `<<<<<<<` conflict markers.
7. Persist `tui.lastDirection = "pull"`.

Switching back to push:

1. Cleanup tempdir.
2. Regular `scan()` against `templateRoot`.
3. Persist `tui.lastDirection = "push"`.

### Pull pipeline (`src/pull.ts`)

```ts
export interface PullPrep {
  tempdir: string;
  copierStderr: string;
}
export interface PullResult {
  written: string[];
  deleted: string[];
  created: string[];
  failed: { path: string; error: string }[];
}

export function detectMigrations(templateRoot: string): Promise<boolean>;
export function preparePullTempdir(projectRoot: string): Promise<PullPrep>;
export function pullChanges(
  files: SyncFile[],
  staged: Map<string, Set<number>>,
  projectRoot: string,
  tempdir: string,
): Promise<PullResult>;
export function cleanupTempdir(tempdir: string): Promise<void>;
export function sweepOrphanTempdirs(maxAgeMs?: number): Promise<string[]>;
```

### `hillbilly doctor`

Replaces `config doctor`. Reports:

- Project root and template resolution source (`cli` / `project-config` / `copier`)
- `copier --version` presence
- Orphan tempdir sweep (paths removed)
- Working-tree cleanliness when project is a git repo (best-effort warning)

### CLI restructure

- `hillbilly sync` (bare): launches TUI; hydrates `direction` from `tui.lastDirection`.
- `hillbilly sync push`: CLI-only. Scans, prints summary, prompts `[y/N]`, then pushes
  (or `--yes` to skip). Non-zero exit on any failure. Auto-bails on non-TTY without `--yes`.
- `hillbilly sync pull`: unchanged. Still wraps `copier update` / `copier recopy`.

### Testing strategy

| Suite                  | Coverage                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `tests/pull.spec.ts`   | NEW. `detectMigrations`, `preparePullTempdir`, `pullChanges`, `cleanupTempdir`, `sweepOrphanTempdirs` |
| `tests/scan.spec.ts`   | Extends with `scanPullDiff` cases                                                                     |
| `tests/index.spec.ts`  | Bare `sync` launches TUI, `sync push` confirm flow, `sync push --yes`, `hillbilly doctor`             |
| `tests/tui.spec.ts`    | Direction toggle, `lastDirection` hydration, conflict-marker indicator, migration-warning state       |
| `tests/config.spec.ts` | Round-trip `lastDirection`, invalid value coercion                                                    |

Baseline at start of sync v2: 218 passing / 20 failing / 1 skipped (stale tests will be
repaired as the touched modules land).

---

## Decisions (sync v2)

| Decision                     | Choice                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Pull architecture            | Option D — Copier in tempdir, hillbilly diff/apply on top                       |
| Selection granularity        | Hunk-level (same UI as push)                                                    |
| Migrations                   | Warn before pull-mode entry                                                     |
| Default direction            | Remember last via `tui.lastDirection`                                           |
| Tempdir location             | `os.tmpdir()/hillbilly-pull-<random>`                                           |
| `sync push` CLI confirmation | Interactive `[y/N]` unless `--yes`; auto-bail on non-TTY                        |
| Pull TUI entry               | Bare `sync` only — no `--pull` flag, `sync pull` keeps copier-wrapper semantics |
| Orphan tempdir cleanup       | Best-effort on exit + `hillbilly doctor` sweep                                  |
| `config doctor` removal      | Replaced by `hillbilly doctor` outright                                         |

---

## Out of scope

- Atomic config writes (pre-existing concern; not regressed)
- Temporal debouncing of config writes (pre-existing; chained-promise serialization stays)
- 3-way merge UI inside hillbilly (Copier's inline markers are the contract)
- Re-rendering Jinja inside hillbilly for pull (subprocess copier always)
- The BetterAuth login hashing bug in the template (separate concern)
