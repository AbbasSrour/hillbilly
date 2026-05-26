import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Pure functions extracted from tui.tsx for testing
// ---------------------------------------------------------------------------

// These are re-implemented here for testability. The originals live in tui.tsx.

const FILE_ICONS: Record<string, string> = {
  "package.json": "\ue718",
  "tsconfig.json": "\ue628",
  "vite.config.ts": "\ue6ba",
  ".eslintrc": "\ue63e",
  ".gitignore": "\ue702",
  ".env": "\uf462",
  dockerfile: "\uf308",
  makefile: "\uf309",
};

function fileIcon(path: string): string {
  const base = path.split("/").pop()?.toLowerCase() ?? "";
  const icon = FILE_ICONS[base] ?? FILE_ICONS[path.toLowerCase()];
  if (icon) return icon;
  if (base.endsWith(".spec.ts") || base.endsWith(".test.ts")) return "\uf432";
  if (base.endsWith(".spec.tsx") || base.endsWith(".test.tsx")) return "\uf432";
  if (base.endsWith(".spec.js") || base.endsWith(".test.js")) return "\uf432";
  if (base.endsWith(".spec.jsx") || base.endsWith(".test.jsx")) return "\uf432";
  if (base.endsWith(".ts")) return "\ue628";
  if (base.endsWith(".tsx")) return "\ue735";
  if (base.endsWith(".js")) return "\ue74e";
  if (base.endsWith(".json")) return "\ue6b1";
  if (base.endsWith(".md")) return "\uf48a";
  if (base.endsWith(".css")) return "\ue749";
  if (base.endsWith(".yaml") || base.endsWith(".yml")) return "\ue6a8";
  if (base.endsWith(".sh")) return "\uf120";
  return "\uf15b";
}

function statusLetter(status: string, formatOnly: boolean | undefined): string {
  if (status === "added") return "A";
  if (status === "moved") return "V";
  if (status === "renamed") return "R";
  if (status === "deleted") return "D";
  if (status === "stale") return "S";
  if (formatOnly) return "F";
  return "M";
}

function truncatePath(path: string, maxLen: number): string {
  if (path.length <= maxLen) return path;
  const slash = path.lastIndexOf("/");
  if (slash === -1) return "\u2026" + path.slice(-(maxLen - 1));
  const tail = path.slice(slash + 1);
  if (tail.length >= maxLen - 1) return "\u2026" + tail.slice(-(maxLen - 2));
  return "\u2026" + path.slice(slash);
}

export function uniqueDisplayNames(paths: string[]): Map<string, string> {
  const result = new Map<string, string>();

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

  for (const [path, name] of currentNames) {
    result.set(path, name);
  }

  return result;
}

function isHunkStaged(staged: Map<string, Set<number>>, projectPath: string, idx: number): boolean {
  return staged.get(projectPath)?.has(idx) ?? false;
}

function stagedCountForFile(staged: Map<string, Set<number>>, file: { projectPath: string; hunks?: unknown[] }): string {
  const set = staged.get(file.projectPath);
  if (!set || set.size === 0) return "";
  const total = file.hunks?.length ?? 1;
  return set.size === total ? "\u2713" : `${set.size}/${total}`;
}

type FakeState = {
  stagedHunks: Map<string, Set<number>>;
  focus: string;
  selectedHunkIndex: number;
};

type FakeFile = {
  projectPath: string;
  status: string;
  hunks?: unknown[];
  movedFrom?: string;
};

function stageAllHunks(state: FakeState, files: FakeFile[]): FakeState {
  const next = new Map(state.stagedHunks);
  const alreadyAll = files.every((f) => {
    if (f.status === "stale") return true;
    const hunkCount = f.hunks?.length ?? 0;
    if (hunkCount === 0 && (f.status === "added" || f.status === "moved" || f.status === "renamed")) {
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
      if (hunkCount === 0 && (f.status === "added" || f.status === "moved" || f.status === "renamed")) {
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

function toggleStagedHunks(state: FakeState, file: FakeFile | undefined): FakeState {
  if (!file) return state;
  if (file.status === "stale") return state;
  const hunkCount = file.hunks?.length ?? 0;
  if (hunkCount === 0 && (file.status === "added" || file.status === "moved" || file.status === "renamed")) {
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
    if (existing.size > 0) {
      next.delete(path);
    } else {
      const all = new Set<number>();
      for (let i = 0; i < hunkCount; i++) all.add(i);
      next.set(path, all);
    }
  } else {
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

function pathChangeLabel(file: FakeFile): string {
  if (!file.movedFrom) return file.status === "renamed" ? "Renamed file" : "Moved file";
  if (
    file.movedFrom.includes("/") &&
    file.projectPath.includes("/") &&
    file.movedFrom.split("/").slice(0, -1).join("/") !==
      file.projectPath.split("/").slice(0, -1).join("/") &&
    file.movedFrom.split("/").pop() !== file.projectPath.split("/").pop()
  ) {
    return "Moved and renamed file";
  }
  return file.status === "renamed" ? "Renamed file" : "Moved file";
}

function hunkDiffHeight(hunk: { text: string }, view: "unified" | "split"): number {
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

interface SplitDiffRow {
  oldLine?: number;
  newLine?: number;
  oldText: string;
  newText: string;
  type: "context" | "change";
}

function splitDiffRows(hunk: { text: string; oldStart: number; newStart: number }): SplitDiffRow[] {
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

function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const base = parts[parts.length - 1] ?? "";

  for (const part of parts) {
    if (
      part === "node_modules" ||
      part === "dist" ||
      part === ".git" ||
      part === "coverage" ||
      part === ".turbo" ||
      part === ".vite" ||
      part === "bin" ||
      part === "paraglide"
    )
      return true;
  }

  if (parts.some((part, index) => part === "i18n" && parts[index + 1] === "generated")) return true;
  if (normalized === "packages/sdk/openapi.json" || normalized.startsWith("packages/sdk/src/"))
    return true;
  if (
    (normalized.startsWith("project.inlang/") || normalized.includes("/project.inlang/")) &&
    !normalized.endsWith("project.inlang/settings.json")
  )
    return true;
  if (
    base.endsWith(".log") ||
    /^\.env(\.(local|development|production|staging|test))?$/.test(base) ||
    base === ".gitkeep" ||
    base === ".DS_Store" ||
    base === ".hillbilly-sync.yml" ||
    base === ".copier-answers.yml" ||
    base === ".copier-answers.yml.jinja"
  )
    return true;
  if (
    base.endsWith(".png") ||
    base.endsWith(".jpg") ||
    base.endsWith(".woff2") ||
    base.endsWith(".ico")
  )
    return true;

  return false;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("fileIcon", () => {
  it("returns icon for known filenames", () => {
    expect(fileIcon("package.json")).toBe("\ue718");
    expect(fileIcon("tsconfig.json")).toBe("\ue628");
    expect(fileIcon(".gitignore")).toBe("\ue702");
  });

  it("returns icon by extension", () => {
    expect(fileIcon("src/foo.ts")).toBe("\ue628");
    expect(fileIcon("src/foo.tsx")).toBe("\ue735");
    expect(fileIcon("src/foo.js")).toBe("\ue74e");
    expect(fileIcon("src/foo.json")).toBe("\ue6b1");
    expect(fileIcon("src/foo.md")).toBe("\uf48a");
    expect(fileIcon("src/foo.css")).toBe("\ue749");
    expect(fileIcon("src/foo.yaml")).toBe("\ue6a8");
    expect(fileIcon("src/foo.yml")).toBe("\ue6a8");
  });

  it("returns test icon for spec/test files", () => {
    expect(fileIcon("foo.spec.ts")).toBe("\uf432");
    expect(fileIcon("foo.test.ts")).toBe("\uf432");
    expect(fileIcon("foo.spec.tsx")).toBe("\uf432");
  });

  it("returns default icon for unknown files", () => {
    expect(fileIcon("unknown.xyz")).toBe("\uf15b");
  });
});

describe("statusLetter", () => {
  it("returns correct single-letter status", () => {
    expect(statusLetter("added", undefined)).toBe("A");
    expect(statusLetter("moved", undefined)).toBe("V");
    expect(statusLetter("renamed", undefined)).toBe("R");
    expect(statusLetter("deleted", undefined)).toBe("D");
    expect(statusLetter("stale", undefined)).toBe("S");
    expect(statusLetter("modified", undefined)).toBe("M");
  });

  it("returns F for format-only modified files", () => {
    expect(statusLetter("modified", true)).toBe("F");
    expect(statusLetter("modified", false)).toBe("M");
  });
});

describe("truncatePath", () => {
  it("returns path unchanged when within limit", () => {
    expect(truncatePath("short.txt", 20)).toBe("short.txt");
  });

  it("truncates mid-path when path is long", () => {
    const result = truncatePath("very/long/path/to/file.ts", 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).toContain("file.ts");
  });

  it("truncates filename itself when no slash", () => {
    const result = truncatePath("very_long_filename.ts", 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.startsWith("\u2026")).toBe(true);
  });
});

describe("uniqueDisplayNames", () => {
  it("returns basename for unique filenames", () => {
    const result = uniqueDisplayNames(["src/a.ts", "src/b.ts"]);
    expect(result.get("src/a.ts")).toBe("a.ts");
    expect(result.get("src/b.ts")).toBe("b.ts");
  });

  it("disambiguates identical basenames with parent dir", () => {
    const result = uniqueDisplayNames(["src/a/index.ts", "src/b/index.ts"]);
    expect(result.get("src/a/index.ts")).toBe("a/index.ts");
    expect(result.get("src/b/index.ts")).toBe("b/index.ts");
  });

  it("disambiguates deeply nested identical basenames", () => {
    const result = uniqueDisplayNames(["pkg/frontend/src/index.ts", "pkg/backend/src/index.ts"]);
    expect(result.get("pkg/frontend/src/index.ts")).toBe("frontend/src/index.ts");
    expect(result.get("pkg/backend/src/index.ts")).toBe("backend/src/index.ts");
  });
});

describe("isHunkStaged", () => {
  it("returns true when hunk index is in staged set", () => {
    const staged = new Map([["file.ts", new Set([0, 2])]]);
    expect(isHunkStaged(staged, "file.ts", 0)).toBe(true);
    expect(isHunkStaged(staged, "file.ts", 1)).toBe(false);
    expect(isHunkStaged(staged, "file.ts", 2)).toBe(true);
  });

  it("returns false when file not in staged map", () => {
    expect(isHunkStaged(new Map(), "file.ts", 0)).toBe(false);
  });
});

describe("stagedCountForFile", () => {
  it("returns empty string when nothing staged", () => {
    const file = { projectPath: "a.ts", hunks: [{}, {}, {}] };
    expect(stagedCountForFile(new Map(), file)).toBe("");
  });

  it("returns checkmark when all hunks staged", () => {
    const staged = new Map([["a.ts", new Set([0, 1, 2])]]);
    const file = { projectPath: "a.ts", hunks: [{}, {}, {}] };
    expect(stagedCountForFile(staged, file)).toBe("\u2713");
  });

  it("returns fraction when partial hunks staged", () => {
    const staged = new Map([["a.ts", new Set([0])]]);
    const file = { projectPath: "a.ts", hunks: [{}, {}, {}] };
    expect(stagedCountForFile(staged, file)).toBe("1/3");
  });
});

describe("stageAllHunks", () => {
  const baseState: FakeState = { stagedHunks: new Map(), focus: "files", selectedHunkIndex: 0 };

  it("stages all hunks for modified files", () => {
    const files: FakeFile[] = [
      { projectPath: "a.ts", status: "modified", hunks: [{}, {}] },
      { projectPath: "b.ts", status: "modified", hunks: [{}] },
    ];
    const result = stageAllHunks(baseState, files);
    expect(result.stagedHunks.get("a.ts")).toEqual(new Set([0, 1]));
    expect(result.stagedHunks.get("b.ts")).toEqual(new Set([0]));
  });

  it("stages whole-file changes for added/moved/renamed", () => {
    const files: FakeFile[] = [
      { projectPath: "new.ts", status: "added" },
      { projectPath: "moved.ts", status: "moved" },
    ];
    const result = stageAllHunks(baseState, files);
    expect(result.stagedHunks.get("new.ts")).toEqual(new Set([0]));
    expect(result.stagedHunks.get("moved.ts")).toEqual(new Set([0]));
  });

  it("skips stale files", () => {
    const files: FakeFile[] = [{ projectPath: "stale.ts", status: "stale" }];
    const result = stageAllHunks(baseState, files);
    expect(result.stagedHunks.has("stale.ts")).toBe(false);
  });

  it("clears all staged when already all staged", () => {
    const state = { ...baseState, stagedHunks: new Map([["a.ts", new Set([0, 1])]]) };
    const files: FakeFile[] = [{ projectPath: "a.ts", status: "modified", hunks: [{}, {}] }];
    const result = stageAllHunks(state, files);
    expect(result.stagedHunks.get("a.ts")).toBe(undefined);
  });
});

describe("toggleStagedHunks", () => {
  const baseState: FakeState = { stagedHunks: new Map(), focus: "files", selectedHunkIndex: 0 };

  it("toggles all file hunks when focus is files", () => {
    const file: FakeFile = { projectPath: "a.ts", status: "modified", hunks: [{}, {}] };
    const result = toggleStagedHunks(baseState, file);
    expect(result.stagedHunks.get("a.ts")).toEqual(new Set([0, 1]));
    const result2 = toggleStagedHunks(result, file);
    expect(result2.stagedHunks.has("a.ts")).toBe(false);
  });

  it("toggles single hunk when focus is diff", () => {
    const state = { ...baseState, focus: "diff", selectedHunkIndex: 1 };
    const file: FakeFile = { projectPath: "a.ts", status: "modified", hunks: [{}, {}, {}] };
    const result = toggleStagedHunks(state, file);
    expect(result.stagedHunks.get("a.ts")).toEqual(new Set([1]));
  });

  it("toggles whole-file for added files", () => {
    const file: FakeFile = { projectPath: "new.ts", status: "added" };
    const result = toggleStagedHunks(baseState, file);
    expect(result.stagedHunks.get("new.ts")).toEqual(new Set([0]));
    const result2 = toggleStagedHunks(result, file);
    expect(result2.stagedHunks.has("new.ts")).toBe(false);
  });

  it("skips stale files", () => {
    const file: FakeFile = { projectPath: "stale.ts", status: "stale" };
    const result = toggleStagedHunks(baseState, file);
    expect(result.stagedHunks.has("stale.ts")).toBe(false);
  });
});

describe("pathChangeLabel", () => {
  it("returns 'Moved file' for directory changes", () => {
    const file = { projectPath: "new/path/file.ts", status: "moved", movedFrom: "old/path/file.ts" };
    expect(pathChangeLabel(file)).toBe("Moved file");
  });

  it("returns 'Renamed file' for name-only changes", () => {
    const file = { projectPath: "path/newname.ts", status: "renamed", movedFrom: "path/oldname.ts" };
    expect(pathChangeLabel(file)).toBe("Renamed file");
  });

  it("returns 'Moved and renamed file' for both directory and name changes", () => {
    const file = {
      projectPath: "new/dir/newname.ts",
      status: "moved",
      movedFrom: "old/dir/oldname.ts",
    };
    expect(pathChangeLabel(file)).toBe("Moved and renamed file");
  });
});

describe("hunkDiffHeight", () => {
  it("returns at least 1", () => {
    const hunk = { text: "@@ -1,0 +1,0 @@" };
    expect(hunkDiffHeight(hunk, "unified")).toBe(1);
  });

  it("counts context lines in unified view", () => {
    const hunk = { text: "@@ -1,3 +1,3 @@\n context1\n context2\n context3" };
    expect(hunkDiffHeight(hunk, "unified")).toBe(3);
  });

  it("pairs added/removed in split view", () => {
    const hunk = { text: "@@ -1,4 +1,4 @@\n-removed1\n+added1\n+added2\n context" };
    expect(hunkDiffHeight(hunk, "split")).toBe(3);
  });
});

describe("splitDiffRows", () => {
  it("produces context rows", () => {
    const hunk = { text: "@@ -1,2 +1,2 @@\n ctx1\n ctx2", oldStart: 0, newStart: 0 };
    const rows = splitDiffRows(hunk);
    expect(rows).toEqual([
      { oldLine: 1, newLine: 1, oldText: "ctx1", newText: "ctx1", type: "context" },
      { oldLine: 2, newLine: 2, oldText: "ctx2", newText: "ctx2", type: "context" },
    ]);
  });

  it("produces change rows with removed/added pairs", () => {
    const hunk = { text: "@@ -1,3 +1,3 @@\n-removed\n+added\n ctx", oldStart: 0, newStart: 0 };
    const rows = splitDiffRows(hunk);
    expect(rows).toEqual([
      { oldLine: 1, newLine: 1, oldText: "removed", newText: "added", type: "change" },
      { oldLine: 2, newLine: 2, oldText: "ctx", newText: "ctx", type: "context" },
    ]);
  });

  it("skips backslash metadata lines", () => {
    const hunk = {
      text: "@@ -1,1 +1,1 @@\n-removed\n+added\n\\ No newline at end of file",
      oldStart: 0,
      newStart: 0,
    };
    const rows = splitDiffRows(hunk);
    expect(rows).toEqual([
      { oldLine: 1, newLine: 1, oldText: "removed", newText: "added", type: "change" },
    ]);
  });
});

describe("shouldExclude", () => {
  it("excludes directory names", () => {
    expect(shouldExclude("node_modules/a.js")).toBe(true);
    expect(shouldExclude("dist/bundle.js")).toBe(true);
    expect(shouldExclude(".git/config")).toBe(true);
    expect(shouldExclude(".vite/hmr")).toBe(true);
    expect(shouldExclude("coverage/lcov.info")).toBe(true);
  });

  it("excludes nested excluded dirs", () => {
    expect(shouldExclude("a/node_modules/b/c.ts")).toBe(true);
  });

  it("excludes i18n generated", () => {
    expect(shouldExclude("apps/frontend/src/i18n/generated/messages.ts")).toBe(true);
  });

  it("keeps inlang settings.json", () => {
    expect(shouldExclude("project.inlang/.meta.json")).toBe(true);
    expect(shouldExclude("apps/web/project.inlang/settings.json")).toBe(false);
  });

  it("excludes .env files but not .env.example", () => {
    expect(shouldExclude(".env")).toBe(true);
    expect(shouldExclude(".env.local")).toBe(true);
    expect(shouldExclude(".env.production")).toBe(true);
    expect(shouldExclude(".env.example")).toBe(false);
  });

  it("excludes binary extensions", () => {
    expect(shouldExclude("image.png")).toBe(true);
    expect(shouldExclude("photo.jpg")).toBe(true);
    expect(shouldExclude("font.woff2")).toBe(true);
    expect(shouldExclude("favicon.ico")).toBe(true);
  });

  it("allows normal source files", () => {
    expect(shouldExclude("src/index.ts")).toBe(false);
    expect(shouldExclude("package.json")).toBe(false);
    expect(shouldExclude("README.md")).toBe(false);
    expect(shouldExclude("apps/backend/src/main.ts")).toBe(false);
  });

  it("excludes .hillbilly-sync.yml and .copier-answers.yml", () => {
    expect(shouldExclude(".hillbilly-sync.yml")).toBe(true);
    expect(shouldExclude(".copier-answers.yml")).toBe(true);
    expect(shouldExclude(".copier-answers.yml.jinja")).toBe(true);
  });
});
