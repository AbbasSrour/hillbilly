# Hillbilly CLI — `hillbilly sync`

## Goal

An interactive terminal UI (like lazygit) to push template-owned changes from a generated project back into the Hillbilly `template/` directory, and to pull template updates via Copier.

## Architecture

```
cli/src/
├── index.ts        # CLI entry (commander: sync push, sync pull)
├── scan.ts         # Marker scanner + diff engine
├── tui.tsx         # OpenTUI React TUI
└── push.ts         # Copy staged files back to template
```

- **Runtime**: Bun only (OpenTUI requires `bun:ffi`)
- **TUI**: `@opentui/core` + `@opentui/react`
- **Deps**: `commander`, `diff`, `fast-glob`, `yaml`

## Marker system

Template-owned files have this as their **first line**:

```ts
/* @hillbilly-sync */
```

## Stage 1 — Scanner (`scan.ts`)

**Deliverable**: Pure function module that, given a project root, returns a list of synced files with diffs.

### What it does:

1. Find template root by reading `.copier-answers.yml` → `_src_path`
2. Walk generated project files looking for `/* @hillbilly-sync */` first-line marker
3. For each marked file, read the corresponding file in `template/apps/backend/src/...`
4. Generate unified diff
5. Return `SyncFile[]` with: `{ projectPath, templatePath, status: 'modified' | 'added' | 'deleted', diff }`

### Test:

```bash
bun run src/test-scan.ts   # runs against test-nest, prints scan results
```

### Verification:

- [ ] Correctly finds `.copier-answers.yml` and extracts `_src_path`
- [ ] Correctly identifies `/* @hillbilly-sync */` files
- [ ] Correctly maps project paths to template paths
- [ ] Produces valid unified diffs for modified files
- [ ] Reports `added` for files in project but not template
- [ ] Reports `deleted` for files in template but not project

---

## Stage 2 — CLI entry (`index.ts`)

**Deliverable**: Commander CLI that registers `hillbilly sync push` and `hillbilly sync pull`.

### What it does:

- `hillbilly sync push`: runs scanner, passes results to TUI
- `hillbilly sync pull`: runs `copier update` (deferred to Stage 6)

### Test:

```bash
bun run src/index.ts sync push --help
bun run src/index.ts sync pull --help
```

### Verification:

- [ ] `sync push` subcommand registered with options
- [ ] `sync pull` subcommand registered
- [ ] `--help` prints usage

---

## Stage 3 — TUI shell (`tui.tsx`)

**Deliverable**: OpenTUI React app that renders a file list from scan results. No diff yet — just the file panel with keyboard navigation (j/k, q to quit).

### What it does:

- Left panel: scrollable file list with status indicators (M, A, D)
- Keyboard: j/k navigate, q quit
- Colored status: green (added), yellow (modified), red (deleted)
- Blank right panel placeholder

### Test:

```bash
bun run src/index.ts sync push --project /path/to/test-nest
```

### Verification:

- [ ] TUI launches and renders file list
- [ ] j/k navigate file list correctly
- [ ] Scrollable when list exceeds viewport
- [ ] q quits and restores terminal
- [ ] Status indicators colored correctly

---

## Stage 4 — Diff preview

**Deliverable**: Right panel shows unified diff for the selected file using `<diff>` renderable.

### What it does:

- Split view: left = file list, right = diff
- Selecting a file in the list renders its diff in the right panel
- Syntax highlighting via `<diff>` renderable
- Tab to switch focus between panels

### Test:

```bash
bun run src/index.ts sync push --project /path/to/test-nest
```

### Verification:

- [ ] Selecting a file renders its diff in the right panel
- [ ] Diff is syntax-highlighted
- [ ] Tab switches focus between panels
- [ ] Scrollable diff for large files

---

## Stage 5 — Staging & push

**Deliverable**: Space to stage/unstage files, Enter to push staged changes back to template.

### What it does:

- Space: toggle file as staged (checkbox/indicator)
- Enter: copy staged files from project → template
- Status indicator for staged files (e.g., green checkmark)
- Footer bar showing shortcut hints

### Test:

```bash
# Modify a marked file in test-nest, then:
bun run src/index.ts sync push --project /path/to/test-nest
# Stage the file with space, press Enter
# Verify file was written to template
```

### Verification:

- [ ] Space toggles staged status
- [ ] Enter writes staged files to correct template paths
- [ ] Non-staged files are not written
- [ ] Success/error feedback after push

---

## Stage 6 — Pull command

**Deliverable**: `sync pull` runs `copier update` in the project directory.

### What it does:

- Shells out to `copier update`
- Passes through stdout/stderr
- Returns exit code

### Test:

```bash
cd /path/to/test-nest && bun run /path/to/cli/src/index.ts sync pull
```

### Verification:

- [ ] `copier update` runs successfully
- [ ] Output is displayed
- [ ] Exit code reflects copier result

---

## Stage 7 — Marker annotation

**Deliverable**: All template-owned files in `template/apps/backend/src/` have `/* @hillbilly-sync */` as first line.

### What it does:

- Script adds marker to boilerplate directories: abstract/, constant/, decorator/, exception/, filter/, guard/, interceptor/, interface/, middleware/, package/, pipe/, provider/, types/, utils/, lib/, i18n/
- Also: main.ts, app.module.ts
- NOT: module/auth/, module/user/ (project-owned)

### Verification:

- [ ] All boilerplate files have marker
- [ ] Module files do NOT have marker
- [ ] `bun run scan` against test-nest finds correct files

---

## Stage 8 — End-to-end test

**Deliverable**: Full workflow verified against test-nest project.

### Test workflow:

1. Regenerate test-nest from template
2. Modify a marked file in test-nest (e.g., add comment to `generator.provider.ts`)
3. Run `hillbilly sync push`, stage file, push
4. Verify change appears in template
5. Revert template change, run `hillbilly sync pull` in test-nest
6. Verify change was pulled back

### Verification:

- [ ] Push works end-to-end
- [ ] Pull works end-to-end
- [ ] No files lost or corrupted
- [ ] Terminal restores cleanly

---

## Build output

Final deliverable: a standalone Bun-compiled binary:

```bash
bun build --compile src/index.ts --outfile dist/hillbilly
```

Placed in `template/bin/hillbilly` for Copier to distribute to generated projects.
