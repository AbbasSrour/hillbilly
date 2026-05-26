import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  normalizeProjectPath,
  readSyncManifest,
  removeSyncFiles,
  setSyncFileState,
  syncManifestPath,
  trackedSyncPaths,
  writeSyncManifest,
  type SyncManifest,
} from "./manifest.js";

const tempRoots: string[] = [];

async function write(path: string, content: string): Promise<void> {
  await mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, content, "utf-8");
}

async function makeTempDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "hillbilly-manifest-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("syncManifestPath", () => {
  it("resolves manifest path relative to project root", () => {
    const result = syncManifestPath("/some/project");
    expect(result).toBe(join("/some", "project", ".hillbilly-sync.yml"));
  });

  it("handles trailing slash in project root", () => {
    const result = syncManifestPath("/some/project/");
    expect(result).toBe(join("/some", "project", ".hillbilly-sync.yml"));
  });

  it("handles dot as project root", () => {
    const result = syncManifestPath(".");
    expect(result).toBe(join(process.cwd(), ".hillbilly-sync.yml"));
  });
});

describe("readSyncManifest", () => {
  it("returns empty manifest when file does not exist", async () => {
    const root = await makeTempDir();
    const result = await readSyncManifest(root);
    expect(result).toEqual({ version: 1, files: [] });
  });

  it("reads valid manifest with tracked and untracked files", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - path: src/index.ts
    state: tracked
  - path: src/ignored.ts
    state: untracked
`,
    );

    const result = await readSyncManifest(root);
    expect(result.version).toBe(1);
    expect(result.files).toHaveLength(2);
    expect(result.files[0]).toEqual({ path: "src/index.ts", state: "tracked" });
    expect(result.files[1]).toEqual({ path: "src/ignored.ts", state: "untracked" });
  });

  it("silently drops malformed entries missing path", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - path: valid.ts
    state: tracked
  - state: tracked
  - path: also-valid.ts
    state: untracked
`,
    );

    const result = await readSyncManifest(root);
    expect(result.files).toHaveLength(2);
    expect(result.files.map((f) => f.path)).toEqual(["valid.ts", "also-valid.ts"]);
  });

  it("silently drops entries with invalid state values", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - path: good.ts
    state: tracked
  - path: bad.ts
    state: deleted
  - path: also-good.ts
    state: untracked
`,
    );

    const result = await readSyncManifest(root);
    expect(result.files).toHaveLength(2);
    expect(result.files.map((f) => f.path)).toEqual(["good.ts", "also-good.ts"]);
  });

  it("returns empty files when files key is not an array", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files: "not an array"
`,
    );

    const result = await readSyncManifest(root);
    expect(result.files).toEqual([]);
  });

  it("returns empty files when YAML is null", async () => {
    const root = await makeTempDir();
    await write(join(root, ".hillbilly-sync.yml"), "null\n");

    const result = await readSyncManifest(root);
    expect(result.files).toEqual([]);
  });

  it("returns empty files when YAML is empty", async () => {
    const root = await makeTempDir();
    await write(join(root, ".hillbilly-sync.yml"), "");

    const result = await readSyncManifest(root);
    expect(result.files).toEqual([]);
  });

  it("drops entries where path is not a string", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - path: 123
    state: tracked
  - path: real.ts
    state: tracked
`,
    );

    const result = await readSyncManifest(root);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe("real.ts");
  });

  it("drops entries that are null instead of objects", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - null
  - path: exists.ts
    state: tracked
`,
    );

    const result = await readSyncManifest(root);
    expect(result.files).toHaveLength(1);
  });

  it("always returns version 1 regardless of stored version", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 99
files: []
`,
    );

    const result = await readSyncManifest(root);
    expect(result.version).toBe(1);
  });
});

describe("writeSyncManifest", () => {
  it("creates manifest file with correct structure", async () => {
    const root = await makeTempDir();
    const manifest: SyncManifest = {
      version: 1,
      files: [{ path: "src/app.ts", state: "tracked" }],
    };

    await writeSyncManifest(root, manifest);

    const content = await readFile(join(root, ".hillbilly-sync.yml"), "utf-8");
    expect(content).toContain("path: src/app.ts");
    expect(content).toContain("state: tracked");
    expect(content).toContain("version: 1");
  });

  it("creates parent directories if needed", async () => {
    const root = await makeTempDir();
    // The manifest path is always at root level, but verify mkdir recursive works
    const manifest: SyncManifest = { version: 1, files: [] };

    await writeSyncManifest(root, manifest);

    const content = await readFile(join(root, ".hillbilly-sync.yml"), "utf-8");
    expect(content.trim()).toBe("version: 1\nfiles: []");
  });

  it("overwrites existing manifest", async () => {
    const root = await makeTempDir();
    await write(
      join(root, ".hillbilly-sync.yml"),
      `version: 1
files:
  - path: old.ts
    state: tracked
`,
    );

    await writeSyncManifest(root, {
      version: 1,
      files: [{ path: "new.ts", state: "tracked" }],
    });

    const result = await readSyncManifest(root);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe("new.ts");
  });

  it("writes empty files array correctly", async () => {
    const root = await makeTempDir();

    await writeSyncManifest(root, { version: 1, files: [] });

    const result = await readSyncManifest(root);
    expect(result.files).toEqual([]);
  });
});

describe("normalizeProjectPath", () => {
  it("returns relative path for file inside project", () => {
    const result = normalizeProjectPath("/project", "/project/src/index.ts");
    expect(result).toBe("src/index.ts");
  });

  it("handles paths with double slashes", () => {
    const result = normalizeProjectPath("/project", "/project//src//index.ts");
    expect(result).toBe("src/index.ts");
  });

  it("handles paths with dots", () => {
    const result = normalizeProjectPath("/project", "/project/./src/./index.ts");
    expect(result).toBe("src/index.ts");
  });

  it("produces ../ path for file outside project root", () => {
    const result = normalizeProjectPath("/project", "/other/file.txt");
    expect(result).toBe("../other/file.txt");
  });

  it("returns empty string for project root itself", () => {
    const result = normalizeProjectPath("/project", "/project");
    expect(result).toBe("");
  });

  it("normalizes backslashes to forward slashes", () => {
    const result = normalizeProjectPath("/project", "src\\index.ts");
    expect(result).toBe("src/index.ts");
  });

  it("handles relative path input", () => {
    const result = normalizeProjectPath("/project", "src/index.ts");
    expect(result).toBe("src/index.ts");
  });

  it("handles parent directory relative path", () => {
    const result = normalizeProjectPath("/project", "../sibling/file.txt");
    expect(result).toBe("../sibling/file.txt");
  });
});

describe("trackedSyncPaths", () => {
  it("returns only tracked file paths", () => {
    const manifest: SyncManifest = {
      version: 1,
      files: [
        { path: "a.ts", state: "tracked" },
        { path: "b.ts", state: "untracked" },
        { path: "c.ts", state: "tracked" },
      ],
    };

    const result = trackedSyncPaths(manifest);
    expect(result).toEqual(["a.ts", "c.ts"]);
  });

  it("returns empty array when no tracked files", () => {
    const manifest: SyncManifest = {
      version: 1,
      files: [{ path: "a.ts", state: "untracked" }],
    };

    const result = trackedSyncPaths(manifest);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty manifest", () => {
    const manifest: SyncManifest = { version: 1, files: [] };
    expect(trackedSyncPaths(manifest)).toEqual([]);
  });
});

describe("setSyncFileState", () => {
  it("creates new manifest with tracked files", async () => {
    const root = await makeTempDir();

    const result = await setSyncFileState(root, ["src/index.ts", "src/utils.ts"], "tracked");

    expect(result.files).toHaveLength(2);
    expect(result.files.map((f) => f.path)).toContain("src/index.ts");
    expect(result.files.map((f) => f.path)).toContain("src/utils.ts");
    expect(result.files.every((f) => f.state === "tracked")).toBe(true);

    const readBack = await readSyncManifest(root);
    expect(readBack.files).toHaveLength(2);
  });

  it("updates state of existing file", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["src/index.ts"], "tracked");

    const result = await setSyncFileState(root, ["src/index.ts"], "untracked");

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.state).toBe("untracked");
  });

  it("preserves existing files when adding new ones", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["existing.ts"], "tracked");

    const result = await setSyncFileState(root, ["new.ts"], "tracked");

    expect(result.files).toHaveLength(2);
    expect(result.files.map((f) => f.path)).toContain("existing.ts");
    expect(result.files.map((f) => f.path)).toContain("new.ts");
  });

  it("normalizes paths before storing", async () => {
    const root = await makeTempDir();

    const result = await setSyncFileState(root, ["./src/./index.ts"], "tracked");

    expect(result.files[0]?.path).toBe("src/index.ts");
  });

  it("handles empty paths array without error", async () => {
    const root = await makeTempDir();

    const result = await setSyncFileState(root, [], "tracked");

    expect(result.files).toEqual([]);
  });

  it("deduplicates paths — last state wins for same normalized path", async () => {
    const root = await makeTempDir();

    const result = await setSyncFileState(root, ["src/index.ts", "src/index.ts"], "tracked");

    expect(result.files).toHaveLength(1);
  });

  it("replaces state for path that existed with different state", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["src/index.ts"], "untracked");

    const result = await setSyncFileState(root, ["src/index.ts"], "tracked");

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.state).toBe("tracked");
  });
});

describe("removeSyncFiles", () => {
  it("removes specified files from manifest", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["a.ts", "b.ts", "c.ts"], "tracked");

    const result = await removeSyncFiles(root, ["b.ts"]);

    expect(result.files).toHaveLength(2);
    expect(result.files.map((f) => f.path)).not.toContain("b.ts");
    expect(result.files.map((f) => f.path)).toContain("a.ts");
    expect(result.files.map((f) => f.path)).toContain("c.ts");
  });

  it("normalizes paths before removing", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["src/index.ts"], "tracked");

    const result = await removeSyncFiles(root, ["./src/./index.ts"]);

    expect(result.files).toHaveLength(0);
  });

  it("does nothing when removing non-existent path", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["a.ts"], "tracked");

    const result = await removeSyncFiles(root, ["nonexistent.ts"]);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe("a.ts");
  });

  it("handles empty paths array", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["a.ts"], "tracked");

    const result = await removeSyncFiles(root, []);

    expect(result.files).toHaveLength(1);
  });

  it("removes multiple files at once", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["a.ts", "b.ts", "c.ts"], "tracked");

    const result = await removeSyncFiles(root, ["a.ts", "c.ts"]);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe("b.ts");
  });

  it("removes both tracked and untracked files", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["tracked.ts"], "tracked");
    await setSyncFileState(root, ["untracked.ts"], "untracked");

    const result = await removeSyncFiles(root, ["tracked.ts", "untracked.ts"]);

    expect(result.files).toHaveLength(0);
  });

  it("writes updated manifest to disk", async () => {
    const root = await makeTempDir();
    await setSyncFileState(root, ["a.ts", "b.ts"], "tracked");

    await removeSyncFiles(root, ["a.ts"]);

    const readBack = await readSyncManifest(root);
    expect(readBack.files).toHaveLength(1);
    expect(readBack.files[0]?.path).toBe("b.ts");
  });
});
