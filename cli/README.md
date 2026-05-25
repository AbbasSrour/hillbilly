# Hillbilly Sync CLI

`hillbilly` is the template synchronization tool for Hillbilly-generated projects. It lets you **push** customizations made inside a generated project back upstream to the Copier template, and **pull** template updates downstream using `copier update`.

**Use case**: You scaffold a project from the Hillbilly template, then customize boilerplate files (NestJS helpers, UI components, RBAC, etc.). When you want to promote those changes back to the template so all future projects benefit, `hillbilly sync push` gives you a lazgit-style interactive UI to stage and push changes at the **hunk level**.

## Installation

The CLI is a self-contained Bun binary. You can run it from source during development, or build the standalone binary:

```bash
# From the hillbilly repo (development)
cd cli
bun run src/index.ts sync push --project /path/to/generated-project

# Build standalone binary
bun build --compile src/index.ts --outfile dist/hillbilly

# Use the binary from anywhere
./dist/hillbilly sync push --project /path/to/generated-project
```

### Requirements

- **Bun** >= 1.x (the CLI runs on the Bun runtime)
- The generated project should either have `.hillbilly.yml`, a global Hillbilly config, or a `.copier-answers.yml` file (produced by `copier copy`)
- Template-owned files are listed in `.hillbilly-sync.yml`

## How It Works

Hillbilly uses a **manifest-based** ownership system. Template-owned files are listed in `.hillbilly-sync.yml`:

```yaml
version: 1
files:
  - path: vite.config.ts
    state: tracked
  - path: apps/backend/src/old-helper.ts
    state: untracked
```

Tracked files are candidates for reverse-sync. `untracked` entries are tombstones: they tell downstream projects that a file was intentionally released from template ownership.

When you run `hillbilly sync push`, the CLI:

1. **Finds the template** using `--template`, `.hillbilly.yml`, global config, or `.copier-answers.yml`
2. **Reads** `.hillbilly-sync.yml`
3. **Diffs** each tracked file against its template counterpart
4. **Parses hunks** from the unified diffs for granular staging
5. **Launches a terminal UI** where you review, stage, and push changes

## Commands

### `hillbilly sync push`

Interactively push template-owned changes from your project back to the Hillbilly template.

```bash
hillbilly sync push [--project <path>] [--template <path>]
```

| Option          | Default | Description                                      |
| --------------- | ------- | ------------------------------------------------ |
| `-p, --project` | `$PWD`  | Path to the generated project                    |
| `-t, --template` | —      | Path to the Hillbilly repo or template directory |

This command opens a two-panel terminal UI:

- **Left panel** — scrollable file list with status indicators (`A` for added, `M` for modified) and staging counts
- **Right panel** — diff view showing individual hunks with `[✓]` staging checkboxes

#### Files and Hunks

The scanner detects two kinds of changes:

| Status   | Description                                                    |
| -------- | -------------------------------------------------------------- |
| Modified | File exists in both project and template, but content differs  |
| Added    | File is tracked but doesn't exist in the template yet          |

For modified files, the diff is parsed into **hunks** — individual change blocks you can stage independently. This means you can push only the specific changes you want, not the entire file. For added files, the entire file content is pushed.

#### Keyboard Controls

| Key            | Context         | Action                                          |
| -------------- | --------------- | ----------------------------------------------- |
| `j` / `↓`      | File list       | Move down one file                              |
| `k` / `↑`      | File list       | Move up one file                                |
| `j` / `↓`      | Diff panel      | Move down one hunk                              |
| `k` / `↑`      | Diff panel      | Move up one hunk                                |
| `Tab`          | Any             | Switch focus between file list and diff panel   |
| `Space`        | File list       | Stage / unstage all hunks for the selected file |
| `Space`        | Diff panel      | Stage / unstage the selected hunk               |
| `Enter`        | Any             | Push all staged changes to the template         |
| `q`            | Any             | Quit (discards staging)                         |
| `Ctrl+C`       | Any             | Quit (discards staging)                         |

#### Push Behavior

When you press `Enter`:

- **Modified files**: Only the hunks you've staged are applied to the corresponding template file. Unstaged hunks stay in your project but are not pushed.
- **Added files**: The full file content is written to the template at the matching relative path. Parent directories are created automatically.

The footer will show the push result — success with file count, or a list of failures.

### `hillbilly sync pull`

Pull template updates downstream into your generated project by running `copier update`.

```bash
hillbilly sync pull [--project <path>]
```

| Option             | Default          | Description                          |
| ------------------ | ---------------- | ------------------------------------ |
| `-p, --project`    | `$PWD`           | Path to the generated project        |

This is a convenience wrapper around `copier update`. It runs the standard Copier update flow in your project directory, applying template changes to your generated project. Use this after someone has pushed template improvements.

### `hillbilly sync mark`

Track files by adding them to `.hillbilly-sync.yml`.

```bash
hillbilly sync mark apps/backend/src/new-helper.ts package.json
```

### `hillbilly sync unmark`

Stop tracking files while keeping tombstones in `.hillbilly-sync.yml`.

```bash
hillbilly sync unmark apps/backend/src/old-helper.ts
```

### `hillbilly sync list`

List tracked and untracked manifest entries.

```bash
hillbilly sync list
```

### `hillbilly config set-template`

Store the local Hillbilly template repo path so `hillbilly sync push` works from inside the generated project without flags.

```bash
# Writes .hillbilly.yml in the generated project
hillbilly config set-template /home/ares/Projects/hillbilly

# Or write global fallback config
hillbilly config set-template /home/ares/Projects/hillbilly --global
```

The project config format is:

```yaml
templateRepo: /home/ares/Projects/hillbilly
templateSubdir: template
```

Resolution order for `sync push` is:

1. `--template <path>`
2. Project `.hillbilly.yml`
3. Global `~/.config/hillbilly/config.yml`
4. Copier `.copier-answers.yml` `_src_path` fallback

### `hillbilly config doctor`

Show how the CLI resolves the template source.

```bash
hillbilly config doctor
hillbilly config doctor --project /path/to/generated-project
hillbilly config doctor --template /home/ares/Projects/hillbilly
```

## Workflow Examples

### Pushing a Fix to the Template

```bash
# 1. Configure once from inside the generated project
hillbilly config set-template /home/ares/Projects/hillbilly

# 2. Make changes to a template-owned file in your generated project
#    (e.g., fix a bug in apps/backend/src/abstract/base.service.ts)

# 3. Open the TUI
hillbilly sync push

# 4. In the TUI:
#    - j/k to find the file
#    - Tab → diff panel
#    - Space on the hunk you want to push (fixes only, skip unrelated changes)
#    - Enter to push
```

### Adding a New Template-Owned File

```bash
# 1. Create the file
cat > apps/backend/src/new-helper.ts << 'EOF'
export function myHelper() { ... }
EOF

# 2. Track it
hillbilly sync mark apps/backend/src/new-helper.ts

# 3. Push it to the template
hillbilly sync push
# New file shows as "A" (added) — Space to stage, Enter to push
```

### Pulling Template Updates

```bash
# Someone improved the template — pull those changes into your project
hillbilly sync pull --project ~/Projects/my-app
```

## Manifest Requirements

For a file to be tracked by `hillbilly sync push`, it must be listed in `.hillbilly-sync.yml` with `state: tracked`. Use `hillbilly sync mark <file...>` rather than editing the manifest by hand.

## Development

### Running from Source

```bash
cd cli
bun run src/index.ts sync push --project /path/to/generated-project
```

### Typecheck

```bash
bun run typecheck
```

### Tests

```bash
bun run test
```

### Building the Standalone Binary

```bash
bun build --compile src/index.ts --outfile dist/hillbilly
```

## Architecture

```
cli/
├── src/
│   ├── index.ts     # Entry point — Commander CLI definition (sync push/pull)
│   ├── config.ts    # Config — template repo resolution and config writing
│   ├── manifest.ts  # Sync manifest read/write helpers
│   ├── scan.ts      # Scanner — manifest entries, template resolution, hunk parsing
│   ├── push.ts      # Push engine — applies staged hunks to template files
│   └── tui.tsx      # Terminal UI — OpenTUI React TUI with two-panel layout
├── dist/
│   └── hillbilly    # Pre-compiled standalone binary (bun build --compile)
├── package.json
└── tsconfig.json
```

**Stack**: Commander (CLI framework), OpenTUI React (terminal UI), fast-glob (file scanning), `diff` (unified diffs), `yaml` (Copier answers parsing), Bun runtime.
