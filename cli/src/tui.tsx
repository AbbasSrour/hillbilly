/** @jsxImportSource @opentui/react */
import { createCliRenderer, type KeyEvent } from "@opentui/core";
import type { CliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useState, useEffect } from "react";
import type { SyncFile, ScanResult } from "./scan.js";
import type { PushResult } from "./push.js";
import { pushChanges } from "./push.js";
import { THEMES, THEME_NAMES, DEFAULT_THEME, type Palette } from "./theme.js";

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
  };
}

// ---------------------------------------------------------------------------
// Module-level refs (bridge between React and renderer key handler)
// ---------------------------------------------------------------------------

let setStateRef: React.Dispatch<React.SetStateAction<State>> | null = null;
let quitResolver: (() => void) | null = null;
let currentFiles: SyncFile[] = [];
let _renderer: CliRenderer | null = null;
let refreshScanRef: (() => Promise<ScanResult>) | null = null;

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

function isHunkStaged(staged: Map<string, Set<number>>, projectPath: string, idx: number): boolean {
  return staged.get(projectPath)?.has(idx) ?? false;
}

function stagedCountForFile(staged: Map<string, Set<number>>, file: SyncFile): string {
  const set = staged.get(file.projectPath);
  if (!set || set.size === 0) return "";
  const total = file.hunks?.length ?? 1;
  return set.size === total ? "\u2713" : `${set.size}/${total}`;
}

function diffLineColors(line: string, p: Palette): { fg: string; bg?: string } {
  if (line.startsWith("+")) return { fg: p.DIFF_ADDED, bg: p.DIFF_ADDED_BG };
  if (line.startsWith("-")) return { fg: p.DIFF_REMOVED, bg: p.DIFF_REMOVED_BG };
  if (line.startsWith("@@")) return { fg: p.DIFF_HUNK_HEADER };
  return { fg: p.TEXT };
}

function toggleStagedHunks(state: State, file: SyncFile | undefined): State {
  if (!file) return state;
  const hunkCount = file.hunks?.length ?? 0;
  if (hunkCount === 0 && file.status === "added") {
    // For added files, toggle the whole file
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

async function doPush(
  state: State,
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
      setState((p) => ({
        ...p,
        pushStatus: "done",
        pushMessage: `Pushed ${result.written.length} file(s), deleted ${result.deleted.length} file(s) successfully.`,
      }));
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
                selectedHunkIndex: Math.min(prev.selectedHunkIndex + 1, Math.max(hCount - 1, 0)),
              };
            }
            return {
              ...prev,
              selectedFileIndex: Math.min(prev.selectedFileIndex + 1, currentFiles.length - 1),
              selectedHunkIndex: 0,
            };

          case "k":
          case "up":
            if (prev.focus === "diff") {
              return {
                ...prev,
                selectedHunkIndex: Math.max(prev.selectedHunkIndex - 1, 0),
              };
            }
            return {
              ...prev,
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

          case "t": {
            const idx = THEME_NAMES.indexOf(prev.themeName);
            const nextTheme = THEME_NAMES[(idx + 1) % THEME_NAMES.length]!;
            return { ...prev, themeName: nextTheme, statusMessage: `Theme: ${nextTheme}` };
          }

          case "enter":
          case "return":
            void doPush(prev, setStateRef!);
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
  currentFiles = result.files;

  const selectedFile = result.files[state.selectedFileIndex] ?? null;
  const hunkCount = selectedFile?.hunks?.length ?? 0;
  const clampedHunkIdx = Math.min(state.selectedHunkIndex, Math.max(hunkCount - 1, 0));

  // Total staged count across all files
  let totalStaged = 0;
  for (const s of state.stagedHunks.values()) totalStaged += s.size;

  const palette = THEMES[state.themeName] ?? THEMES[DEFAULT_THEME]!;

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={palette.BG}>
      {/* Header */}
      <box
        flexDirection="row"
        alignItems="center"
        border={["bottom"]}
        borderColor={palette.BORDER}
        paddingY={0}
        paddingX={1}
        backgroundColor={palette.HEADER_FG}
      >
        <text fg={palette.TEXT}>
          Hillbilly Sync | {result.files.length} file{result.files.length !== 1 ? "s" : ""} changed
          {totalStaged > 0 ? ` | ${totalStaged} staged` : ""} | j/k nav q quit t theme
        </text>
      </box>

      {/* Main content area */}
      <box flexDirection="row" flexGrow={1}>
        {/* File list panel */}
        <box width="30%" border={["right"]} borderColor={palette.BORDER} flexDirection="column">
          {result.files.map((file, i) => {
            const isSelected = i === state.selectedFileIndex;
            const statusColor =
              file.status === "added"
                ? palette.SUCCESS
                : file.status === "deleted"
                  ? palette.ERROR
                  : palette.WARNING;
            const count = stagedCountForFile(state.stagedHunks, file);
            return (
              <box
                key={file.projectPath}
                flexDirection="row"
                alignItems="center"
                backgroundColor={isSelected ? palette.SELECTED_BG : undefined}
                paddingY={0}
                paddingX={1}
              >
                <text fg={palette.TEXT}>{isSelected ? "> " : "  "}</text>
                <text fg={statusColor}>
                  {file.status === "added" ? "A" : file.status === "deleted" ? "D" : "M"}
                </text>
                <text fg={palette.TEXT}> {truncatePath(file.projectPath, 22)}</text>
                {count !== "" && <text fg={palette.SUCCESS}> {count}</text>}
              </box>
            );
          })}
        </box>

        {/* Diff view panel */}
        <box flexGrow={1} flexDirection="column">
          {!selectedFile && (
            <box paddingY={0} paddingX={1}>
              <text fg={palette.TEXT}>No files to display.</text>
            </box>
          )}

          {selectedFile?.status === "added" && (
            <box paddingY={0} paddingX={1} flexDirection="column">
              <text fg={palette.SUCCESS}>New file (added)</text>
              <text fg={palette.TEXT}> {selectedFile.projectPath}</text>
              <text fg={palette.TEXT}>
                {selectedFile.projectContent?.split("\n").slice(0, 30).join("\n")}
              </text>
            </box>
          )}

          {selectedFile?.status === "deleted" && (
            <box paddingY={0} paddingX={1} flexDirection="column">
              <text fg={palette.ERROR}>Deleted file</text>
              <text fg={palette.TEXT}> {selectedFile.projectPath}</text>
              <text fg={palette.TEXT}>Stage this file to delete it from the template.</text>
            </box>
          )}

          {selectedFile?.status === "modified" && selectedFile.hunks && (
            <box paddingY={0} paddingX={1} flexDirection="column">
              <text fg={palette.TEXT} truncate>
                {selectedFile.projectPath}
              </text>
              {selectedFile.hunks.map((hunk, hi) => {
                const staged = isHunkStaged(state.stagedHunks, selectedFile.projectPath, hi);
                const isHunkSelected = hi === clampedHunkIdx && state.focus === "diff";
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
                    {hunk.text
                      .split("\n")
                      .slice(1)
                      .map((line, lineIndex) => {
                        const colors = diffLineColors(line, palette);
                        return (
                          <text key={`${hi}-${lineIndex}`} fg={colors.fg} bg={colors.bg} truncate>
                            {line}
                          </text>
                        );
                      })}
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
        </box>
      </box>

      {/* Footer */}
      <box
        flexDirection="row"
        alignItems="center"
        border={["top"]}
        borderColor={palette.BORDER}
        paddingY={0}
        paddingX={1}
        backgroundColor={palette.HEADER_FG}
      >
        {state.pushStatus === "idle" && (
          <text fg={palette.TEXT}>
            [Space] stage/unstage [Tab] switch panel [r] refresh [t] theme [Enter] push staged [q]
            quit
            {state.statusMessage ? ` | ${state.statusMessage}` : ""}
          </text>
        )}
        {state.pushStatus === "pushing" && <text fg={palette.WARNING}>Pushing changes...</text>}
        {state.pushStatus === "done" && (
          <text fg={palette.SUCCESS}>{state.pushMessage} [q] quit</text>
        )}
        {state.pushStatus === "error" && <text fg={palette.ERROR}>{state.pushMessage} [q] quit</text>}
      </box>
    </box>
  );
}

// ---------------------------------------------------------------------------
// launchTui — entry point
// ---------------------------------------------------------------------------

export async function launchTui(result: ScanResult): Promise<void> {
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

  await new Promise<void>((resolve) => {
    quitResolver = resolve;
    const root = createRoot(renderer);
    root.render(<SyncTui scanResult={result} />);
    renderer.start();
  });

  // Cleanup after quit
  _renderer = null;
  renderer.stop();
  renderer.destroy();
}
