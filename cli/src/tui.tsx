/** @jsxImportSource @opentui/react */
import {
  createCliRenderer,
  type KeyEvent,
  SyntaxStyle,
  TreeSitterClient,
  getDataPaths,
  pathToFiletype,
} from "@opentui/core";
import type { CliRenderer, ThemeTokenStyle } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { useState, useEffect } from "react";
import type { SyncFile, ScanResult, DiffHunk } from "./scan.js";
import type { PushResult } from "./push.js";
import { pushChanges } from "./push.js";
import { GLOBAL_CONFIG_PATH, readConfig, writeConfig } from "./config.js";
import { removeSyncFiles, setSyncFileState } from "./manifest.js";
import { THEMES, THEME_NAMES, DEFAULT_THEME, type Palette } from "./theme.js";

const FILE_ICONS: Record<string, string> = {
  "package.json": "\ue718",
  "tsconfig.json": "\ue628",
  "vite.config.ts": "\ue6ba",
  "vite.config.js": "\ue6ba",
  "vite.config.mts": "\ue6ba",
  ".eslintrc": "\ue63e",
  ".eslintrc.js": "\ue63e",
  ".eslintrc.json": "\ue63e",
  ".eslintrc.cjs": "\ue63e",
  ".prettierrc": "\ue6b3",
  ".prettierrc.js": "\ue6b3",
  ".prettierrc.json": "\ue6b3",
  dockerfile: "\uf308",
  "docker-compose.yml": "\uf308",
  "docker-compose.yaml": "\uf308",
  makefile: "\uf309",
  "cargo.toml": "\ue6a8",
  "go.mod": "\ue627",
  "go.sum": "\ue627",
  ".gitignore": "\ue702",
  ".gitattributes": "\ue702",
  ".env": "\uf462",
  ".env.local": "\uf462",
  ".env.production": "\uf462",
  ".env.development": "\uf462",
  ".env.test": "\uf462",
  "readme.md": "\uf48a",
  license: "\uf49c",
  "license.md": "\uf49c",
  "bun.lock": "\ue6a7",
  "bun.lockb": "\ue6a7",
  "bunfig.toml": "\ue6a7",
  "pnpm-lock.yaml": "\uf1b3",
  "yarn.lock": "\uf1b3",
  "turbo.json": "\uf1b3",
  ".nvmrc": "\ue718",
  ".node-version": "\ue718",
};

function fileIcon(path: string): string {
  const base = path.split("/").pop()?.toLowerCase() ?? "";
  const icon = FILE_ICONS[base] ?? FILE_ICONS[path.toLowerCase()];
  if (icon) return icon;
  if (base.endsWith(".spec.ts") || base.endsWith(".test.ts")) return "\uf432";
  if (base.endsWith(".spec.tsx") || base.endsWith(".test.tsx")) return "\uf432";
  if (base.endsWith(".spec.js") || base.endsWith(".test.js")) return "\uf432";
  if (base.endsWith(".spec.jsx") || base.endsWith(".test.jsx")) return "\uf432";
  if (base.endsWith(".d.ts")) return "\ue628";
  if (base.endsWith(".ts")) return "\ue628";
  if (base.endsWith(".tsx")) return "\ue735";
  if (base.endsWith(".js")) return "\ue74e";
  if (base.endsWith(".jsx")) return "\ue735";
  if (base.endsWith(".mjs") || base.endsWith(".cjs")) return "\ue74e";
  if (base.endsWith(".json")) return "\ue6b1";
  if (base.endsWith(".md")) return "\uf48a";
  if (base.endsWith(".mdx")) return "\uf48a";
  if (base.endsWith(".css")) return "\ue749";
  if (base.endsWith(".scss")) return "\ue749";
  if (base.endsWith(".html")) return "\uf13b";
  if (base.endsWith(".yaml") || base.endsWith(".yml")) return "\ue6a8";
  if (base.endsWith(".toml")) return "\ue6a8";
  if (base.endsWith(".py")) return "\ue73c";
  if (base.endsWith(".rs")) return "\ue6a8";
  if (base.endsWith(".go")) return "\ue627";
  if (base.endsWith(".rb")) return "\ue739";
  if (base.endsWith(".java")) return "\uf4b4";
  if (base.endsWith(".php")) return "\ue73d";
  if (base.endsWith(".sh") || base.endsWith(".bash") || base.endsWith(".zsh")) return "\uf120";
  if (base.endsWith(".sql")) return "\uf1c0";
  if (base.endsWith(".graphql") || base.endsWith(".gql")) return "\ue6b8";
  if (base.endsWith(".proto")) return "\ue6b8";
  if (base.endsWith(".dockerfile")) return "\uf308";
  if (base.endsWith(".lock")) return "\uf023";
  if (base.endsWith(".svg")) return "\uf1c5";
  if (
    base.endsWith(".png") ||
    base.endsWith(".jpg") ||
    base.endsWith(".gif") ||
    base.endsWith(".webp")
  )
    return "\uf1c5";
  if (base.endsWith(".log")) return "\uf448";
  if (base.endsWith(".cfg") || base.endsWith(".ini") || base.endsWith(".conf")) return "\uf013";
  if (base.endsWith(".jinja")) return "\ue6ac";
  return "\uf15b";
}

function statusLetter(status: SyncFile["status"], formatOnly: boolean | undefined): string {
  if (status === "added") return "A";
  if (status === "moved") return "V";
  if (status === "renamed") return "R";
  if (status === "deleted") return "D";
  if (status === "stale") return "S";
  if (formatOnly) return "F";
  return "M";
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface State {
  selectedFileIndex: number;
  selectedHunkIndex: number;
  focus: "files" | "diff";
  stagedHunks: Map<string, Set<number>>;
  pushStatus: "idle" | "pushing" | "done" | "error";
  pushMessage: string;
  statusMessage: string;
  themeName: string;
  diffView: "unified" | "split";
  diffLineColors: boolean;
  diffSigns: boolean;
  showLineNumbers: boolean;
  pendingPrunePath: string | null;
}

function makeInitialState(): State {
  return {
    selectedFileIndex: 0,
    selectedHunkIndex: 0,
    focus: "files",
    stagedHunks: new Map(),
    pushStatus: "idle",
    pushMessage: "",
    statusMessage: "",
    themeName: DEFAULT_THEME,
    diffView: "unified",
    diffLineColors: true,
    diffSigns: true,
    showLineNumbers: true,
    pendingPrunePath: null,
  };
}

// ---------------------------------------------------------------------------
// Module-level refs (bridge between React and renderer key handler)
// ---------------------------------------------------------------------------

let setStateRef: React.Dispatch<React.SetStateAction<State>> | null = null;
let quitResolver: (() => void) | null = null;
let currentFiles: SyncFile[] = [];
let currentScanResult: ScanResult;
let _renderer: CliRenderer | null = null;
let refreshScanRef: (() => Promise<ScanResult>) | null = null;
let _treeSitterClient: TreeSitterClient | null = null;

// Cache SyntaxStyle per palette to avoid recreating
const _syntaxStyleCache = new Map<string, SyntaxStyle>();
function paletteToSyntaxStyle(palette: Palette): SyntaxStyle {
  const cacheKey = palette.BG + palette.TEXT + palette.SYNTAX_COMMENT;
  const cached = _syntaxStyleCache.get(cacheKey);
  if (cached) return cached;

  const tokens: ThemeTokenStyle[] = [
    { scope: ["comment"], style: { foreground: palette.SYNTAX_COMMENT, italic: true } },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator",
        "conditional",
        "repeat",
        "exception",
        "include",
      ],
      style: { foreground: palette.SYNTAX_KEYWORD },
    },
    {
      scope: ["function", "function.builtin", "method", "constructor"],
      style: { foreground: palette.SYNTAX_FUNCTION },
    },
    { scope: ["string", "string.special"], style: { foreground: palette.SYNTAX_STRING } },
    {
      scope: ["number", "boolean", "constant.builtin"],
      style: { foreground: palette.SYNTAX_NUMBER },
    },
    { scope: ["type", "type.builtin", "property"], style: { foreground: palette.SYNTAX_TYPE } },
    { scope: ["operator"], style: { foreground: palette.SYNTAX_OPERATOR } },
    {
      scope: ["punctuation", "punctuation.bracket", "punctuation.delimiter", "punctuation.special"],
      style: { foreground: palette.SYNTAX_PUNCTUATION },
    },
    { scope: ["variable", "variable.parameter"], style: { foreground: palette.TEXT } },
  ];

  const style = SyntaxStyle.fromTheme(tokens);
  _syntaxStyleCache.set(cacheKey, style);
  return style;
}

// Build a mini unified diff string for a single hunk
function hunkDiffForFile(file: SyncFile, hunk: DiffHunk): string {
  return `--- ${file.projectPath}\n+++ ${file.projectPath}\n${hunk.text}\n`;
}

function hunkDiffHeight(hunk: DiffHunk, view: "unified" | "split"): number {
  const lines = hunk.text
    .split("\n")
    .slice(1)
    .filter((line) => line !== "");
  if (view === "unified") return Math.max(1, lines.length);

  let height = 0;
  for (let i = 0; i < lines.length; ) {
    const line = lines[i]!;
    if (line.startsWith(" ") || line.startsWith("\\")) {
      height++;
      i++;
      continue;
    }

    let removed = 0;
    let added = 0;
    while (i < lines.length && !lines[i]!.startsWith(" ")) {
      if (lines[i]!.startsWith("-")) removed++;
      else if (lines[i]!.startsWith("+")) added++;
      i++;
    }
    height += Math.max(removed, added, 1);
  }

  return Math.max(1, height);
}

function resolveTreeSitterWorkerPath(): string | null {
  const candidates = [
    resolve(dirname(process.execPath), "parser.worker.js"),
    resolve(process.cwd(), "bin/parser.worker.js"),
    resolve(process.cwd(), "node_modules/@opentui/core/parser.worker.js"),
    resolve(import.meta.dirname, "../node_modules/@opentui/core/parser.worker.js"),
  ];

  return candidates.find((path) => existsSync(path)) ?? null;
}

function getSharedTreeSitterClient(): TreeSitterClient | null {
  if (_treeSitterClient) return _treeSitterClient;

  const workerPath = resolveTreeSitterWorkerPath();
  if (!workerPath) return null;

  const dataPaths = getDataPaths();
  const client = new TreeSitterClient({
    dataPath: dataPaths.globalDataPath,
    workerPath,
    initTimeout: 1_000,
  });
  client.on("error", () => {
    // OpenTUI falls back to unstyled content if highlighting fails.
  });
  _treeSitterClient = client;
  return client;
}

async function saveThemePreference(themeName: string): Promise<void> {
  const config = (await readConfig(GLOBAL_CONFIG_PATH)) ?? {};
  await writeConfig(GLOBAL_CONFIG_PATH, {
    ...config,
    tui: {
      ...config.tui,
      theme: themeName,
    },
  });
}

async function saveTuiPreferences(state: State): Promise<void> {
  const config = (await readConfig(GLOBAL_CONFIG_PATH)) ?? {};
  await writeConfig(GLOBAL_CONFIG_PATH, {
    ...config,
    tui: {
      ...config.tui,
      theme: state.themeName,
      diffView: state.diffView,
      diffLineColors: state.diffLineColors,
      diffSigns: state.diffSigns,
      showLineNumbers: state.showLineNumbers,
    },
  });
}

interface SplitDiffRow {
  oldLine?: number;
  newLine?: number;
  oldText: string;
  newText: string;
  type: "context" | "change";
}

function splitDiffRows(hunk: DiffHunk): SplitDiffRow[] {
  const rows: SplitDiffRow[] = [];
  const lines = hunk.text
    .split("\n")
    .slice(1)
    .filter((line) => line !== "");
  let oldLine = hunk.oldStart + 1;
  let newLine = hunk.newStart + 1;

  for (let i = 0; i < lines.length; ) {
    const line = lines[i]!;
    if (line.startsWith(" ")) {
      const text = line.slice(1);
      rows.push({ oldLine, newLine, oldText: text, newText: text, type: "context" });
      oldLine++;
      newLine++;
      i++;
      continue;
    }

    if (line.startsWith("\\")) {
      i++;
      continue;
    }

    const removed: Array<{ line: number; text: string }> = [];
    const added: Array<{ line: number; text: string }> = [];
    while (i < lines.length && !lines[i]!.startsWith(" ")) {
      const current = lines[i]!;
      if (current.startsWith("-")) {
        removed.push({ line: oldLine, text: current.slice(1) });
        oldLine++;
      } else if (current.startsWith("+")) {
        added.push({ line: newLine, text: current.slice(1) });
        newLine++;
      }
      i++;
    }

    const count = Math.max(removed.length, added.length, 1);
    for (let idx = 0; idx < count; idx++) {
      rows.push({
        oldLine: removed[idx]?.line,
        newLine: added[idx]?.line,
        oldText: removed[idx]?.text ?? "",
        newText: added[idx]?.text ?? "",
        type: "change",
      });
    }
  }

  return rows;
}

function SplitHunkDiff({
  hunk,
  palette,
  lineColors,
  signs,
  lineNumbers,
}: {
  hunk: DiffHunk;
  palette: Palette;
  lineColors: boolean;
  signs: boolean;
  lineNumbers: boolean;
}) {
  return (
    <box flexDirection="column" width="100%">
      {splitDiffRows(hunk).map((row, idx) => {
        const leftBg = lineColors && row.type === "change" ? palette.DIFF_REMOVED_BG : undefined;
        const rightBg = lineColors && row.type === "change" ? palette.DIFF_ADDED_BG : undefined;
        const contextBg =
          lineColors && row.type === "context" ? palette.DIFF_CONTEXT_BG : undefined;
        const oldNumber = row.oldLine === undefined ? "    " : String(row.oldLine).padStart(4, " ");
        const newNumber = row.newLine === undefined ? "    " : String(row.newLine).padStart(4, " ");
        const oldPrefix = `${lineNumbers ? oldNumber : ""}${signs && row.type === "change" ? " - " : "   "}`;
        const newPrefix = `${lineNumbers ? newNumber : ""}${signs && row.type === "change" ? " + " : "   "}`;
        return (
          <box key={idx} flexDirection="row" width="100%">
            <box width="50%" backgroundColor={leftBg ?? contextBg}>
              <text
                width="100%"
                fg={row.type === "change" ? palette.DIFF_REMOVED : palette.TEXT}
                bg={leftBg ?? contextBg}
                truncate
              >
                {oldPrefix + row.oldText}
              </text>
            </box>
            <box width="50%" backgroundColor={rightBg ?? contextBg}>
              <text
                width="100%"
                fg={row.type === "change" ? palette.DIFF_ADDED : palette.TEXT}
                bg={rightBg ?? contextBg}
                truncate
              >
                {newPrefix + row.newText}
              </text>
            </box>
          </box>
        );
      })}
    </box>
  );
}

/** For testing — set the renderer before mounting SyncTui directly */
export function setTestRenderer(r: CliRenderer) {
  _renderer = r;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) return path;
  const slash = path.lastIndexOf("/");
  if (slash === -1) return "\u2026" + path.slice(-(maxLen - 1));
  const tail = path.slice(slash + 1);
  if (tail.length >= maxLen - 1) return "\u2026" + tail.slice(-(maxLen - 2));
  return "\u2026" + path.slice(slash);
}

/**
 * Compute unique display names for a list of paths.
 * When multiple files share the same basename, progressively prepend parent
 * directories until all names are unique.
 */
function uniqueDisplayNames(paths: string[]): Map<string, string> {
  const result = new Map<string, string>();

  // Group by current name
  function groupByName(currentNames: Map<string, string>): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const [path, name] of currentNames) {
      const list = groups.get(name) ?? [];
      list.push(path);
      groups.set(name, list);
    }
    return groups;
  }

  let currentNames = new Map<string, string>();
  for (const path of paths) {
    const parts = path.split("/");
    currentNames.set(path, parts[parts.length - 1] ?? path);
  }

  // Keep expanding names that collide
  let changed = true;
  while (changed) {
    changed = false;
    const groups = groupByName(currentNames);
    const nextNames = new Map<string, string>();

    for (const [name, groupPaths] of groups) {
      if (groupPaths.length === 1) {
        nextNames.set(groupPaths[0]!, name);
        continue;
      }

      // Collision — prepend one more parent segment for all in the group
      for (const path of groupPaths) {
        const parts = path.split("/");
        const current = currentNames.get(path)!;
        const currentParts = current.split("/");
        const parentIndex = parts.length - 1 - currentParts.length;
        if (parentIndex >= 0) {
          nextNames.set(path, `${parts[parentIndex]}/${current}`);
          changed = true;
        } else {
          nextNames.set(path, path);
        }
      }
    }
    currentNames = nextNames;
  }

  // Truncate from the left if still too long, showing the unique tail
  for (const [path, name] of currentNames) {
    result.set(path, name);
  }

  return result;
}

function isHunkStaged(staged: Map<string, Set<number>>, projectPath: string, idx: number): boolean {
  return staged.get(projectPath)?.has(idx) ?? false;
}

function stagedCountForFile(staged: Map<string, Set<number>>, file: SyncFile): string {
  const set = staged.get(file.projectPath);
  if (!set || set.size === 0) return "";
  const total = file.hunks?.length ?? 1;
  return set.size === total ? "\u2713" : `${set.size}/${total}`;
}

function stageAllHunks(state: State, files: SyncFile[]): State {
  const next = new Map(state.stagedHunks);
  const alreadyAll = files.every((f) => {
    if (f.status === "stale") return true;
    const hunkCount = f.hunks?.length ?? 0;
    if (
      hunkCount === 0 &&
      (f.status === "added" || f.status === "moved" || f.status === "renamed")
    ) {
      return next.has(f.projectPath);
    }
    return (next.get(f.projectPath)?.size ?? 0) === hunkCount;
  });
  if (alreadyAll) {
    next.clear();
  } else {
    for (const f of files) {
      if (f.status === "stale") continue;
      const hunkCount = f.hunks?.length ?? 0;
      if (
        hunkCount === 0 &&
        (f.status === "added" || f.status === "moved" || f.status === "renamed")
      ) {
        next.set(f.projectPath, new Set([0]));
      } else {
        const all = new Set<number>();
        for (let i = 0; i < hunkCount; i++) all.add(i);
        next.set(f.projectPath, all);
      }
    }
  }
  return { ...state, stagedHunks: next };
}

function toggleStagedHunks(state: State, file: SyncFile | undefined): State {
  if (!file) return state;
  if (file.status === "stale") return state;
  const hunkCount = file.hunks?.length ?? 0;
  if (
    hunkCount === 0 &&
    (file.status === "added" || file.status === "moved" || file.status === "renamed")
  ) {
    // For whole-file changes, toggle the whole file.
    const next = new Map(state.stagedHunks);
    if (next.has(file.projectPath)) {
      next.delete(file.projectPath);
    } else {
      next.set(file.projectPath, new Set([0]));
    }
    return { ...state, stagedHunks: next };
  }

  const next = new Map(state.stagedHunks);
  const path = file.projectPath;
  const existing = new Set(next.get(path) ?? []);

  if (state.focus === "files") {
    // Toggle all hunks for this file
    if (existing.size > 0) {
      next.delete(path);
    } else {
      const all = new Set<number>();
      for (let i = 0; i < hunkCount; i++) all.add(i);
      next.set(path, all);
    }
  } else {
    // Toggle the currently selected hunk
    const idx = state.selectedHunkIndex;
    if (existing.has(idx)) {
      existing.delete(idx);
      if (existing.size === 0) next.delete(path);
      else next.set(path, existing);
    } else {
      existing.add(idx);
      next.set(path, existing);
    }
  }

  return { ...state, stagedHunks: next };
}

function pathChangeLabel(file: SyncFile): string {
  if (!file.movedFrom) return file.status === "renamed" ? "Renamed file" : "Moved file";
  if (
    dirname(file.movedFrom) !== dirname(file.projectPath) &&
    basename(file.movedFrom) !== basename(file.projectPath)
  ) {
    return "Moved and renamed file";
  }
  return file.status === "renamed" ? "Renamed file" : "Moved file";
}

async function doPush(
  state: State,
  setResult: React.Dispatch<React.SetStateAction<ScanResult>>,
  setState: React.Dispatch<React.SetStateAction<State>>,
): Promise<void> {
  if (state.pushStatus === "pushing") return;
  if (state.stagedHunks.size === 0) {
    setState((p) => ({
      ...p,
      pushStatus: "error",
      pushMessage: "No changes staged. Use Space to stage hunks.",
    }));
    return;
  }

  // Capture staged set before async work
  const staged = new Map([...state.stagedHunks].map(([k, v]) => [k, new Set(v)]));

  setState((p) => ({ ...p, pushStatus: "pushing", pushMessage: "" }));

  try {
    const templateRoot = ""; // not needed, paths are absolute in SyncFile
    const result: PushResult = await pushChanges(currentFiles, staged, templateRoot);
    if (result.failed.length > 0) {
      setState((p) => ({
        ...p,
        pushStatus: "error",
        pushMessage: result.failed.map((f) => `${f.path}: ${f.error}`).join("; "),
      }));
    } else {
      const pushMessage = `Pushed ${result.written.length} file(s), deleted ${result.deleted.length} file(s) successfully.`;
      if (refreshScanRef) {
        const next = await refreshScanRef();
        setResult(next);
      }
      setState((p) => ({
        ...p,
        selectedFileIndex: 0,
        selectedHunkIndex: 0,
        stagedHunks: new Map(),
        pushStatus: "done",
        pushMessage,
        statusMessage: pushMessage,
      }));
      setTimeout(() => {
        setState((p) =>
          p.pushStatus === "done"
            ? { ...p, pushStatus: "idle", pushMessage: "", statusMessage: pushMessage }
            : p,
        );
      }, 2_000);
    }
  } catch (err: unknown) {
    setState((p) => ({
      ...p,
      pushStatus: "error",
      pushMessage: err instanceof Error ? err.message : String(err),
    }));
  }
}

async function doRefresh(
  setResult: React.Dispatch<React.SetStateAction<ScanResult>>,
  setState: React.Dispatch<React.SetStateAction<State>>,
): Promise<void> {
  if (!refreshScanRef) return;

  setState((p) => ({
    ...p,
    pushStatus: "idle",
    pushMessage: "",
    statusMessage: "Refreshing...",
  }));

  try {
    const next = await refreshScanRef();
    setResult(next);
    setState((prev) => ({
      ...makeInitialState(),
      themeName: prev.themeName,
      diffView: prev.diffView,
      diffLineColors: prev.diffLineColors,
      diffSigns: prev.diffSigns,
      showLineNumbers: prev.showLineNumbers,
      statusMessage: `Refreshed ${next.files.length} file${next.files.length === 1 ? "" : "s"}.`,
    }));
  } catch (err: unknown) {
    setState((p) => ({
      ...p,
      pushStatus: "error",
      pushMessage: err instanceof Error ? err.message : String(err),
      statusMessage: "",
    }));
  }
}

async function doUnmarkSelected(
  file: SyncFile | undefined,
  setResult: React.Dispatch<React.SetStateAction<ScanResult>>,
  setState: React.Dispatch<React.SetStateAction<State>>,
): Promise<void> {
  if (!file) return;

  try {
    await setSyncFileState(currentScanResult.projectRoot, [file.projectPath], "untracked");
    const next = refreshScanRef ? await refreshScanRef() : currentScanResult;
    setResult(next);
    setState((prev) => ({
      ...prev,
      selectedFileIndex: Math.min(prev.selectedFileIndex, Math.max(next.files.length - 1, 0)),
      selectedHunkIndex: 0,
      stagedHunks: new Map([...prev.stagedHunks].filter(([path]) => path !== file.projectPath)),
      pushStatus: "idle",
      pushMessage: "",
      statusMessage: `Unmarked ${file.projectPath}`,
    }));
  } catch (err: unknown) {
    setState((prev) => ({
      ...prev,
      pushStatus: "error",
      pushMessage: err instanceof Error ? err.message : String(err),
    }));
  }
}

async function doPruneSelected(
  file: SyncFile | undefined,
  setResult: React.Dispatch<React.SetStateAction<ScanResult>>,
  setState: React.Dispatch<React.SetStateAction<State>>,
): Promise<void> {
  if (!file || file.status !== "stale") return;

  try {
    await rm(resolve(currentScanResult.projectRoot, file.projectPath), { force: true });
    await removeSyncFiles(currentScanResult.projectRoot, [file.projectPath]);
    const next = refreshScanRef ? await refreshScanRef() : currentScanResult;
    setResult(next);
    setState((prev) => ({
      ...prev,
      selectedFileIndex: Math.min(prev.selectedFileIndex, Math.max(next.files.length - 1, 0)),
      selectedHunkIndex: 0,
      pendingPrunePath: null,
      stagedHunks: new Map([...prev.stagedHunks].filter(([path]) => path !== file.projectPath)),
      pushStatus: "idle",
      pushMessage: "",
      statusMessage: `Pruned ${file.projectPath}`,
    }));
  } catch (err: unknown) {
    setState((prev) => ({
      ...prev,
      pushStatus: "error",
      pushMessage: err instanceof Error ? err.message : String(err),
    }));
  }
}

// ---------------------------------------------------------------------------
// SyncTui Component
// ---------------------------------------------------------------------------

export function SyncTui({ scanResult }: { scanResult: ScanResult }) {
  const [state, setState] = useState<State>(makeInitialState);
  const [result, setResult] = useState(scanResult);

  // Expose setState to the external key handler
  useEffect(() => {
    setStateRef = setState;
    return () => {
      setStateRef = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void readConfig(GLOBAL_CONFIG_PATH).then((config) => {
      const themeName = config?.tui?.theme;
      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          themeName: themeName && THEMES[themeName] ? themeName : prev.themeName,
          diffView: config?.tui?.diffView ?? prev.diffView,
          diffLineColors: config?.tui?.diffLineColors ?? prev.diffLineColors,
          diffSigns: config?.tui?.diffSigns ?? prev.diffSigns,
          showLineNumbers: config?.tui?.showLineNumbers ?? prev.showLineNumbers,
          statusMessage:
            themeName && THEMES[themeName] ? `Theme: ${themeName}` : prev.statusMessage,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Attach key handler via the renderer
  useEffect(() => {
    const r = _renderer;
    if (!r) return;

    const handler = (event: KeyEvent) => {
      setState((prev) => {
        const file = currentFiles[prev.selectedFileIndex];
        const hCount = file?.hunks?.length ?? 0;

        if (event.name === "c" && event.ctrl) {
          r.keyInput.off("keypress", handler);
          quitResolver?.();
          return prev;
        }

        switch (event.name) {
          case "q":
            r.keyInput.off("keypress", handler);
            quitResolver?.();
            return prev;

          case "j":
          case "down":
            if (prev.focus === "diff") {
              return {
                ...prev,
                pendingPrunePath: null,
                selectedHunkIndex: Math.min(prev.selectedHunkIndex + 1, Math.max(hCount - 1, 0)),
              };
            }
            return {
              ...prev,
              pendingPrunePath: null,
              selectedFileIndex: Math.min(prev.selectedFileIndex + 1, currentFiles.length - 1),
              selectedHunkIndex: 0,
            };

          case "k":
          case "up":
            if (prev.focus === "diff") {
              return {
                ...prev,
                pendingPrunePath: null,
                selectedHunkIndex: Math.max(prev.selectedHunkIndex - 1, 0),
              };
            }
            return {
              ...prev,
              pendingPrunePath: null,
              selectedFileIndex: Math.max(prev.selectedFileIndex - 1, 0),
              selectedHunkIndex: 0,
            };

          case "tab": {
            const nextFocus = prev.focus === "files" ? "diff" : "files";
            return {
              ...prev,
              focus: nextFocus,
              selectedHunkIndex:
                nextFocus === "diff"
                  ? Math.min(prev.selectedHunkIndex, Math.max(hCount - 1, 0))
                  : 0,
            };
          }

          case "space":
          case " ":
            return toggleStagedHunks(prev, file);

          case "r":
            void doRefresh(setResult, setState);
            return prev;

          case "u":
            void doUnmarkSelected(file, setResult, setState);
            return prev;

          case "a":
            return stageAllHunks(prev, currentFiles);

          case "d":
            if (file?.status !== "stale") return prev;
            if (prev.pendingPrunePath === file.projectPath) {
              void doPruneSelected(file, setResult, setState);
              return prev;
            }
            return {
              ...prev,
              pendingPrunePath: file.projectPath,
              statusMessage: `Press d again to prune ${file.projectPath}`,
            };

          case "t": {
            const idx = THEME_NAMES.indexOf(prev.themeName);
            const nextTheme = THEME_NAMES[(idx + 1) % THEME_NAMES.length]!;
            void saveThemePreference(nextTheme);
            return { ...prev, themeName: nextTheme, statusMessage: `Theme: ${nextTheme}` };
          }

          case "s": {
            const diffView: State["diffView"] = prev.diffView === "unified" ? "split" : "unified";
            const next = { ...prev, diffView, statusMessage: `Diff view: ${diffView}` };
            void saveTuiPreferences(next);
            return next;
          }

          case "b": {
            const next = {
              ...prev,
              diffLineColors: !prev.diffLineColors,
              statusMessage: `Line colors: ${!prev.diffLineColors ? "on" : "off"}`,
            };
            void saveTuiPreferences(next);
            return next;
          }

          case "g": {
            const next = {
              ...prev,
              diffSigns: !prev.diffSigns,
              statusMessage: `+/- markers: ${!prev.diffSigns ? "on" : "off"}`,
            };
            void saveTuiPreferences(next);
            return next;
          }

          case "l": {
            const next = {
              ...prev,
              showLineNumbers: !prev.showLineNumbers,
              statusMessage: `Line numbers: ${!prev.showLineNumbers ? "on" : "off"}`,
            };
            void saveTuiPreferences(next);
            return next;
          }

          case "enter":
          case "return":
            void doPush(prev, setResult, setStateRef!);
            return prev;

          default:
            return prev;
        }
      });
    };

    r.keyInput.on("keypress", handler);
    return () => {
      r.keyInput.off("keypress", handler);
    };
  }, []);

  // Keep module-level files ref in sync for the key handler
  currentScanResult = result;
  currentFiles = result.files;

  const selectedFile = result.files[state.selectedFileIndex] ?? null;
  const hunkCount = selectedFile?.hunks?.length ?? 0;
  const clampedHunkIdx = Math.min(state.selectedHunkIndex, Math.max(hunkCount - 1, 0));

  // Total staged count across all files
  let totalStaged = 0;
  for (const s of state.stagedHunks.values()) totalStaged += s.size;

  const displayNames = uniqueDisplayNames(result.files.map((f) => f.projectPath));

  const palette = THEMES[state.themeName] ?? THEMES[DEFAULT_THEME]!;
  const flistRows = Math.max(1, (_renderer?.height ?? 24) - 2);
  const fileWindowStart = Math.max(
    0,
    Math.min(
      state.selectedFileIndex - Math.floor(flistRows / 2),
      Math.max(0, result.files.length - flistRows),
    ),
  );
  const visibleFiles = result.files.slice(fileWindowStart, fileWindowStart + flistRows);

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={palette.BG}>
      {/* Header — fixed 1 row */}
      <box
        flexDirection="row"
        alignItems="center"
        height={1}
        flexShrink={0}
        paddingY={0}
        paddingX={1}
        backgroundColor={palette.HEADER_FG}
      >
        <text fg={palette.TEXT} width="100%" truncate>
          Hillbilly Sync | {result.files.length} file{result.files.length !== 1 ? "s" : ""} changed
          {totalStaged > 0 ? ` | ${totalStaged} staged` : ""} | {state.diffView} | j/k nav a all q
          quit d prune u unmark t theme s split b colors g signs l lines
        </text>
      </box>

      {/* Main content area — fills remaining space */}
      <box flexDirection="row" flexGrow={1} minHeight={0}>
        {/* File list panel */}
        <box
          width="25%"
          flexDirection="column"
          border={["right"]}
          borderColor={state.focus === "files" ? palette.BORDER_ACTIVE : palette.BORDER}
        >
          <scrollbox
            flexGrow={1}
            minHeight={0}
            verticalScrollbarOptions={{ visible: false }}
            horizontalScrollbarOptions={{ visible: false }}
            scrollY
            focused={state.focus === "files"}
          >
            {visibleFiles.map((file, visibleIndex) => {
              const index = fileWindowStart + visibleIndex;
              const isSelected = index === state.selectedFileIndex;
              const statusColor =
                file.status === "added" || file.status === "moved" || file.status === "renamed"
                  ? palette.SUCCESS
                  : file.status === "deleted"
                    ? palette.ERROR
                    : file.status === "stale"
                      ? palette.ERROR
                      : file.formatOnly
                        ? palette.INFO
                        : palette.WARNING;
              const count = stagedCountForFile(state.stagedHunks, file);
              const icon = fileIcon(file.projectPath);
              return (
                <box
                  key={file.projectPath}
                  flexDirection="row"
                  alignItems="center"
                  height={1}
                  flexShrink={0}
                  backgroundColor={isSelected ? palette.SELECTED_BG : undefined}
                  paddingY={0}
                  paddingX={1}
                >
                  <text fg={palette.TEXT}>{isSelected ? ">" : " "}</text>
                  <text fg={statusColor}>{statusLetter(file.status, file.formatOnly)}</text>
                  <text fg={palette.TEXT}> </text>
                  <text fg={palette.TEXT_MUTED}>{icon} </text>
                  <box flexGrow={1} minWidth={0}>
                    <text fg={palette.TEXT} wrapMode="none" truncate>
                      {displayNames.get(file.projectPath) ?? file.projectPath}
                    </text>
                  </box>
                  {count !== "" && <text fg={palette.SUCCESS}> {count}</text>}
                </box>
              );
            })}
          </scrollbox>
        </box>

        {/* Diff view panel */}
        <box flexGrow={1} minHeight={0} flexDirection="column">
          {/* File path header — fixed 1 row when a file is selected */}
          {selectedFile && (
            <box
              height={1}
              flexShrink={0}
              paddingY={0}
              paddingX={1}
              backgroundColor={palette.HEADER_FG}
            >
              <text fg={palette.TEXT} width="100%" truncate>
                {selectedFile.status === "moved" || selectedFile.status === "renamed"
                  ? `${selectedFile.movedFrom} -> ${selectedFile.projectPath}`
                  : selectedFile.projectPath}
              </text>
            </box>
          )}

          <scrollbox
            flexGrow={1}
            minHeight={0}
            verticalScrollbarOptions={{ visible: false }}
            horizontalScrollbarOptions={{ visible: false }}
            scrollY
            focused={state.focus === "diff"}
          >
            {!selectedFile && (
              <box paddingY={0} paddingX={1}>
                <text fg={palette.TEXT}>No files to display.</text>
              </box>
            )}

            {selectedFile?.status === "added" && (
              <box paddingY={0} paddingX={1} flexDirection="column">
                <text fg={palette.SUCCESS}>New file (added)</text>
                <text fg={palette.TEXT}> {selectedFile.projectPath}</text>
                <text fg={palette.TEXT}>{selectedFile.projectContent}</text>
              </box>
            )}

            {(selectedFile?.status === "moved" || selectedFile?.status === "renamed") && (
              <box paddingY={0} paddingX={1} flexDirection="column">
                <text fg={palette.SUCCESS}>{pathChangeLabel(selectedFile)}</text>
                <text fg={palette.TEXT}>
                  {" "}
                  {selectedFile.movedFrom} -&gt; {selectedFile.projectPath}
                </text>
                <text fg={palette.TEXT}>Stage this file to update the template path.</text>
              </box>
            )}

            {selectedFile?.status === "deleted" && (
              <box paddingY={0} paddingX={1} flexDirection="column">
                <text fg={palette.ERROR}>Deleted file</text>
                <text fg={palette.TEXT}> {selectedFile.projectPath}</text>
                <text fg={palette.TEXT}>Stage this file to delete it from the template.</text>
              </box>
            )}

            {selectedFile?.status === "stale" && (
              <box paddingY={0} paddingX={1} flexDirection="column">
                <text fg={palette.ERROR}>Stale tracked file</text>
                <text fg={palette.TEXT}> {selectedFile.projectPath}</text>
                <text fg={palette.TEXT}>
                  This file is tracked but no longer exists in the template.
                </text>
                <text fg={palette.TEXT}>[d] delete from project and remove manifest entry</text>
                <text fg={palette.WARNING}>Requires confirmation: press d twice.</text>
                <text fg={palette.TEXT}>[u] keep project file but mark untracked</text>
              </box>
            )}

            {selectedFile?.status === "modified" && selectedFile.hunks && (
              <box paddingY={0} paddingX={1} flexDirection="column">
                <text fg={palette.TEXT} truncate>
                  {selectedFile.projectPath}
                </text>
                {selectedFile.formatOnly && (
                  <text fg={palette.INFO}>
                    Formatting/style-only difference. Raw content still differs and can be staged.
                  </text>
                )}
                {selectedFile.hunks.map((hunk, hi) => {
                  const staged = isHunkStaged(state.stagedHunks, selectedFile.projectPath, hi);
                  const isHunkSelected = hi === clampedHunkIdx && state.focus === "diff";
                  const filetype = pathToFiletype(selectedFile.projectPath);
                  const syntaxStyle = paletteToSyntaxStyle(palette);
                  const treeSitterClient = getSharedTreeSitterClient();
                  return (
                    <box
                      key={hi}
                      backgroundColor={isHunkSelected ? palette.SELECTED_BG : undefined}
                      marginBottom={1}
                    >
                      <text fg={palette.TEXT}>
                        [{staged ? "\u2713" : " "}] @@ -{hunk.oldStart + 1},{hunk.oldLines} +
                        {hunk.newStart + 1},{hunk.newLines} @@
                      </text>
                      <diff
                        diff={hunkDiffForFile(selectedFile, hunk)}
                        view={state.diffView}
                        width="100%"
                        height={hunkDiffHeight(hunk, state.diffView)}
                        syntaxStyle={syntaxStyle}
                        treeSitterClient={treeSitterClient ?? undefined}
                        filetype={filetype}
                        fg={palette.TEXT}
                        addedBg={state.diffLineColors ? palette.DIFF_ADDED_BG : palette.BG}
                        removedBg={state.diffLineColors ? palette.DIFF_REMOVED_BG : palette.BG}
                        contextBg={state.diffLineColors ? palette.DIFF_CONTEXT_BG : palette.BG}
                        addedContentBg={state.diffLineColors ? palette.DIFF_ADDED_BG : palette.BG}
                        removedContentBg={
                          state.diffLineColors ? palette.DIFF_REMOVED_BG : palette.BG
                        }
                        contextContentBg={
                          state.diffLineColors ? palette.DIFF_CONTEXT_BG : palette.BG
                        }
                        addedSignColor={state.diffSigns ? palette.DIFF_ADDED : palette.BG}
                        removedSignColor={state.diffSigns ? palette.DIFF_REMOVED : palette.BG}
                        lineNumberFg={palette.TEXT_MUTED}
                        lineNumberBg={state.diffLineColors ? palette.DIFF_CONTEXT_BG : palette.BG}
                        addedLineNumberBg={
                          state.diffLineColors ? palette.DIFF_ADDED_BG : palette.BG
                        }
                        removedLineNumberBg={
                          state.diffLineColors ? palette.DIFF_REMOVED_BG : palette.BG
                        }
                        wrapMode="none"
                        showLineNumbers={state.showLineNumbers}
                      />
                    </box>
                  );
                })}
              </box>
            )}

            {selectedFile?.status === "modified" &&
              (!selectedFile.hunks || selectedFile.hunks.length === 0) && (
                <box paddingY={0} paddingX={1}>
                  <text fg={palette.WARNING}>No hunks parsed from diff.</text>
                </box>
              )}
          </scrollbox>
        </box>
      </box>

      {/* Footer — fixed 1 row */}
      <box
        flexDirection="row"
        alignItems="center"
        height={1}
        flexShrink={0}
        paddingY={0}
        paddingX={1}
        backgroundColor={palette.HEADER_FG}
      >
        {state.pushStatus === "idle" && (
          <text fg={palette.TEXT} width="100%" truncate>
            [Space] stage/unstage [a] stage all [Tab] switch panel [r] refresh [t] theme [Enter]
            push staged [q] quit [d] prune stale [u] unmark [s] split/unified [b] colors [g] signs
            [l] lines
            {state.statusMessage ? ` | ${state.statusMessage}` : ""}
          </text>
        )}
        {state.pushStatus === "pushing" && (
          <text fg={palette.WARNING} width="100%" truncate>
            Pushing changes...
          </text>
        )}
        {state.pushStatus === "done" && (
          <text fg={palette.SUCCESS} width="100%" truncate>
            {state.pushMessage} [q] quit
          </text>
        )}
        {state.pushStatus === "error" && (
          <text fg={palette.ERROR} width="100%" truncate>
            {state.pushMessage} [q] quit
          </text>
        )}
      </box>
    </box>
  );
}

// ---------------------------------------------------------------------------
// launchTui — entry point
// ---------------------------------------------------------------------------

export async function launchTui(
  result: ScanResult,
  refreshScan?: () => Promise<ScanResult>,
): Promise<void> {
  const defaultPalette = THEMES[DEFAULT_THEME]!;
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    screenMode: "alternate-screen",
    useMouse: false,
    enableMouseMovement: false,
    consoleMode: "disabled",
    backgroundColor: defaultPalette.BG,
  });
  _renderer = renderer;
  refreshScanRef = refreshScan ?? null;

  await new Promise<void>((resolve) => {
    quitResolver = resolve;
    const root = createRoot(renderer);
    root.render(<SyncTui scanResult={result} />);
    renderer.start();
  });

  // Cleanup after quit
  _renderer = null;
  refreshScanRef = null;
  renderer.stop();
  renderer.destroy();
  if (_treeSitterClient) {
    void _treeSitterClient.destroy();
    _treeSitterClient = null;
  }
}
