/** @jsxImportSource @opentui/react */
import { createCliRenderer, type KeyEvent } from "@opentui/core";
import type { CliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { useState, useEffect } from "react";
import type { SyncFile, ScanResult } from "./scan.js";
import type { PushResult } from "./push.js";
import { pushChanges } from "./push.js";

// ---------------------------------------------------------------------------
// Colors (Tokyo Night)
// ---------------------------------------------------------------------------

const BG = "#1a1b26";
const TEXT = "#c0caf5";
const SELECTED_BG = "#283457";
const GREEN = "#9ece6a";
const YELLOW = "#e0af68";
const RED = "#f7768e";
const BORDER = "#3b4261";
const HEADER_FG = "#24283b";
const DIFF_ADDED_BG = "#1a3a2a";
const DIFF_REMOVED_BG = "#3a1a1a";

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
}

function makeInitialState(): State {
  return {
    selectedFileIndex: 0,
    selectedHunkIndex: 0,
    focus: "files",
    stagedHunks: new Map(),
    pushStatus: "idle",
    pushMessage: "",
  };
}

// ---------------------------------------------------------------------------
// Module-level refs (bridge between React and renderer key handler)
// ---------------------------------------------------------------------------

let setStateRef: React.Dispatch<React.SetStateAction<State>> | null = null;
let quitResolver: (() => void) | null = null;
let currentFiles: SyncFile[] = [];
let _renderer: CliRenderer | null = null;

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

function isHunkStaged(
  staged: Map<string, Set<number>>,
  projectPath: string,
  idx: number,
): boolean {
  return staged.get(projectPath)?.has(idx) ?? false;
}

function stagedCountForFile(
  staged: Map<string, Set<number>>,
  file: SyncFile,
): string {
  const set = staged.get(file.projectPath);
  if (!set || set.size === 0) return "";
  const total = file.hunks?.length ?? 1;
  return set.size === total ? "\u2713" : `${set.size}/${total}`;
}

function toggleStagedHunks(
  state: State,
  file: SyncFile | undefined,
): State {
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
  const staged = new Map(
    [...state.stagedHunks].map(([k, v]) => [k, new Set(v)]),
  );

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
        pushMessage: `Pushed ${result.written.length} file(s) successfully.`,
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

// ---------------------------------------------------------------------------
// SyncTui Component
// ---------------------------------------------------------------------------

export function SyncTui({ scanResult }: { scanResult: ScanResult }) {
  const [state, setState] = useState<State>(makeInitialState);

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
  currentFiles = scanResult.files;

  const selectedFile = scanResult.files[state.selectedFileIndex] ?? null;
  const hunkCount = selectedFile?.hunks?.length ?? 0;
  const clampedHunkIdx = Math.min(state.selectedHunkIndex, Math.max(hunkCount - 1, 0));

  // Total staged count across all files
  let totalStaged = 0;
  for (const s of state.stagedHunks.values()) totalStaged += s.size;

  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      backgroundColor={BG}
    >
      {/* Header */}
      <box
        flexDirection="row"
        alignItems="center"
        border={["bottom"]}
        borderColor={BORDER}
        paddingY={0}
        paddingX={1}
        backgroundColor={HEADER_FG}
      >
        <text fg={TEXT}>
          Hillbilly Sync | {scanResult.files.length} file{scanResult.files.length !== 1 ? "s" : ""} changed
          {totalStaged > 0 ? ` | ${totalStaged} staged` : ""}
          {" "}| j/k nav q quit
        </text>
      </box>

      {/* Main content area */}
      <box flexDirection="row" flexGrow={1}>
        {/* File list panel */}
        <scrollbox
          width="30%"
          border={["right"]}
          borderColor={BORDER}
          scrollY
        >
          {scanResult.files.map((file, i) => {
            const isSelected = i === state.selectedFileIndex;
            const statusColor = file.status === "added" ? GREEN : YELLOW;
            const count = stagedCountForFile(state.stagedHunks, file);
            return (
              <box
                key={file.projectPath}
                flexDirection="row"
                alignItems="center"
                backgroundColor={isSelected ? SELECTED_BG : undefined}
                paddingY={0}
                paddingX={1}
              >
                <text fg={TEXT}>{isSelected ? "> " : "  "}</text>
                <text fg={statusColor}>
                  {file.status === "added" ? "A" : "M"}
                </text>
                <text fg={TEXT}> {truncatePath(file.projectPath, 22)}</text>
                {count !== "" && (
                  <text fg={GREEN}> {count}</text>
                )}
              </box>
            );
          })}
        </scrollbox>

        {/* Diff view panel */}
        <scrollbox
          flexGrow={1}
          scrollY
        >
          {!selectedFile && (
            <box paddingY={0} paddingX={1}>
              <text fg={TEXT}>No files to display.</text>
            </box>
          )}

          {selectedFile?.status === "added" && (
            <box paddingY={0} paddingX={1} flexDirection="column">
              <text fg={GREEN}>New file (added)</text>
              <text fg={TEXT}> {selectedFile.projectPath}</text>
              <text fg={TEXT}>
                {selectedFile.projectContent
                  ?.split("\n")
                  .slice(0, 30)
                  .join("\n")}
              </text>
            </box>
          )}

          {selectedFile?.status === "modified" && selectedFile.hunks && (
            <box paddingY={0} paddingX={1} flexDirection="column">
              <text fg={TEXT} truncate>
                {selectedFile.projectPath}
              </text>
              {selectedFile.hunks.map((hunk, hi) => {
                const staged = isHunkStaged(
                  state.stagedHunks,
                  selectedFile.projectPath,
                  hi,
                );
                const isHunkSelected =
                  hi === clampedHunkIdx && state.focus === "diff";
                return (
                  <box
                    key={hi}
                    backgroundColor={isHunkSelected ? SELECTED_BG : undefined}
                    marginBottom={1}
                  >
                    <text fg={TEXT}>
                      [{staged ? "\u2713" : " "}] @@ -
                      {hunk.oldStart + 1},{hunk.oldLines} +
                      {hunk.newStart + 1},{hunk.newLines} @@
                    </text>
                    <diff
                      diff={hunk.text}
                      view="unified"
                      showLineNumbers={false}
                      fg={TEXT}
                      addedBg={DIFF_ADDED_BG}
                      removedBg={DIFF_REMOVED_BG}
                      addedSignColor={GREEN}
                      removedSignColor={RED}
                    />
                  </box>
                );
              })}
            </box>
          )}

          {selectedFile?.status === "modified" &&
            (!selectedFile.hunks || selectedFile.hunks.length === 0) && (
              <box paddingY={0} paddingX={1}>
                <text fg={YELLOW}>No hunks parsed from diff.</text>
              </box>
            )}
        </scrollbox>
      </box>

      {/* Footer */}
      <box
        flexDirection="row"
        alignItems="center"
        border={["top"]}
        borderColor={BORDER}
        paddingY={0}
        paddingX={1}
        backgroundColor={HEADER_FG}
      >
        {state.pushStatus === "idle" && (
          <text fg={TEXT}>
            [Space] stage/unstage [Tab] switch panel [Enter] push staged [q] quit
          </text>
        )}
        {state.pushStatus === "pushing" && (
          <text fg={YELLOW}>Pushing changes...</text>
        )}
        {state.pushStatus === "done" && (
          <text fg={GREEN}>{state.pushMessage} [q] quit</text>
        )}
        {state.pushStatus === "error" && (
          <text fg={RED}>{state.pushMessage} [q] quit</text>
        )}
      </box>
    </box>
  );
}

// ---------------------------------------------------------------------------
// launchTui — entry point
// ---------------------------------------------------------------------------

export async function launchTui(result: ScanResult): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: false });
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
