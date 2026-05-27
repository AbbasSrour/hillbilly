import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { pushChanges } from "../src/push.js";
import type { SyncFile } from "../src/scan.js";

const tempRoots: string[] = [];

async function write(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf-8");
}

async function makeTempDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "hillbilly-push-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function makeSyncFile(overrides: Partial<SyncFile>): SyncFile {
  return {
    projectPath: "file.txt",
    templatePath: "/template/file.txt",
    status: "modified",
    ...overrides,
  };
}

describe("pushChanges — modified files with hunks", () => {
  it("applies selected hunk indices to template file", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "line1\nline2\nline3\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "LINE1\nline2\nLINE3\n",
        hunks: [
          {
            text: "@@ -1,3 +1,3 @@\n-line1\n+LINE1\n line2\n-line3\n+LINE3",
            oldStart: 0,
            oldLines: 3,
            newStart: 0,
            newLines: 3,
          },
        ],
      }),
    ];
    const staged = new Map([["file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    expect(result.failed).toEqual([]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("LINE1\nline2\nLINE3\n");
  });

  it("pushes all hunks when staged set is empty", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "line1\nline2\nline3\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "LINE1\nline2\nLINE3\n",
        hunks: [
          {
            text: "@@ -1,3 +1,3 @@\n-line1\n+LINE1\n line2\n-line3\n+LINE3",
            oldStart: 0,
            oldLines: 3,
            newStart: 0,
            newLines: 3,
          },
        ],
      }),
    ];
    const staged = new Map([["file.txt", new Set<number>()]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("LINE1\nline2\nLINE3\n");
  });

  it("writes projectContent directly when no hunks available", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "old content\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "new content\n",
        hunks: [],
      }),
    ];
    const staged = new Map([["file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("new content\n");
  });

  it("fails when modified file has no hunks and no projectContent", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "old content\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        hunks: [],
        projectContent: undefined,
      }),
    ];
    const staged = new Map([["file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.path).toBe(templatePath);
    expect(result.failed[0]?.error).toContain("projectContent is missing");
    expect(result.written).toEqual([]);
  });

  it("fails when template file cannot be read for hunk application", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "nonexistent.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "content\n",
        hunks: [
          {
            text: "@@ -1,1 +1,1 @@\n-old\n+new",
            oldStart: 0,
            oldLines: 1,
            newStart: 0,
            newLines: 1,
          },
        ],
      }),
    ];
    const staged = new Map([["file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.path).toBe(templatePath);
    expect(result.written).toEqual([]);
  });
});

describe("pushChanges — added files", () => {
  it("writes new file to template directory", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "new-file.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "new-file.txt",
        templatePath,
        status: "added",
        projectContent: "brand new content\n",
      }),
    ];
    const staged = new Map([["new-file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    expect(result.failed).toEqual([]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("brand new content\n");
  });

  it("creates parent directories for added file", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "deep", "nested", "dir", "new-file.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "deep/nested/dir/new-file.txt",
        templatePath,
        status: "added",
        projectContent: "nested content\n",
      }),
    ];
    const staged = new Map([["deep/nested/dir/new-file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("nested content\n");
  });

  it("fails when added file has no projectContent", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "new-file.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "new-file.txt",
        templatePath,
        status: "added",
        projectContent: undefined,
      }),
    ];
    const staged = new Map([["new-file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.error).toContain("projectContent is missing");
    expect(result.written).toEqual([]);
  });
});

describe("pushChanges — deleted files", () => {
  it("deletes template file and records it", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "to-delete.txt");
    await write(templatePath, "will be deleted\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "to-delete.txt",
        templatePath,
        status: "deleted",
      }),
    ];
    const staged = new Map([["to-delete.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.deleted).toEqual([templatePath]);
    expect(result.failed).toEqual([]);
    await expect(readFile(templatePath, "utf-8")).rejects.toThrow();
  });

  it("fails when template file does not exist for deletion", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "nonexistent.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "to-delete.txt",
        templatePath,
        status: "deleted",
      }),
    ];
    const staged = new Map([["to-delete.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.path).toBe(templatePath);
    expect(result.deleted).toEqual([]);
  });
});

describe("pushChanges — moved/renamed files", () => {
  it("writes content to new template path and deletes old one", async () => {
    const root = await makeTempDir();
    const newTemplatePath = join(root, "template", "new-location.txt");
    const oldTemplatePath = join(root, "template", "old-location.txt");
    await write(oldTemplatePath, "moved content\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "new-location.txt",
        templatePath: newTemplatePath,
        status: "moved",
        projectContent: "moved content\n",
        movedFrom: "old-location.txt",
        movedFromTemplatePath: oldTemplatePath,
      }),
    ];
    const staged = new Map([["new-location.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toContain(newTemplatePath);
    expect(result.deleted).toContain(oldTemplatePath);
    expect(result.failed).toEqual([]);

    const content = await readFile(newTemplatePath, "utf-8");
    expect(content).toBe("moved content\n");
    await expect(readFile(oldTemplatePath, "utf-8")).rejects.toThrow();
  });

  it("handles renamed file without old template path", async () => {
    const root = await makeTempDir();
    const newTemplatePath = join(root, "template", "renamed.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "renamed.txt",
        templatePath: newTemplatePath,
        status: "renamed",
        projectContent: "renamed content\n",
        movedFrom: "original.txt",
        movedFromTemplatePath: undefined,
      }),
    ];
    const staged = new Map([["renamed.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([newTemplatePath]);
    expect(result.deleted).toEqual([]);
    expect(result.failed).toEqual([]);

    const content = await readFile(newTemplatePath, "utf-8");
    expect(content).toBe("renamed content\n");
  });

  it("fails when moved/renamed file has no projectContent", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "moved.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "moved.txt",
        templatePath,
        status: "moved",
        projectContent: undefined,
      }),
    ];
    const staged = new Map([["moved.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.error).toContain("projectContent is missing");
    expect(result.written).toEqual([]);
  });
});

describe("pushChanges — stale files", () => {
  it("skips stale files entirely", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "stale.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "stale.txt",
        templatePath,
        status: "stale",
        projectContent: "stale content\n",
      }),
    ];
    const staged = new Map([["stale.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([]);
    expect(result.deleted).toEqual([]);
    expect(result.failed).toEqual([]);
  });
});

describe("pushChanges — staging behavior", () => {
  it("skips files not in staged map", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "original\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "changed\n",
      }),
    ];
    const staged = new Map<string, Set<number>>();

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([]);
    expect(result.failed).toEqual([]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("original\n");
  });

  it("processes multiple files independently", async () => {
    const root = await makeTempDir();
    const pathA = join(root, "template", "a.txt");
    const pathB = join(root, "template", "b.txt");
    await write(pathA, "old a\n");
    await write(pathB, "old b\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "a.txt",
        templatePath: pathA,
        status: "modified",
        projectContent: "new a\n",
      }),
      makeSyncFile({
        projectPath: "b.txt",
        templatePath: pathB,
        status: "added",
        projectContent: "new b\n",
      }),
    ];
    const staged = new Map([
      ["a.txt", new Set([0])],
      ["b.txt", new Set([0])],
    ]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([pathA, pathB]);
    expect(result.failed).toEqual([]);
  });

  it("continues processing after one file fails", async () => {
    const root = await makeTempDir();
    const badPath = join(root, "template", "bad.txt");
    const goodPath = join(root, "template", "good.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "bad.txt",
        templatePath: badPath,
        status: "deleted",
      }),
      makeSyncFile({
        projectPath: "good.txt",
        templatePath: goodPath,
        status: "added",
        projectContent: "good content\n",
      }),
    ];
    const staged = new Map([
      ["bad.txt", new Set([0])],
      ["good.txt", new Set([0])],
    ]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.path).toBe(badPath);
    expect(result.written).toEqual([goodPath]);
  });

  it("handles empty files array", async () => {
    const root = await makeTempDir();
    const staged = new Map([["ghost.txt", new Set([0])]]);

    const result = await pushChanges([], staged, root);

    expect(result.written).toEqual([]);
    expect(result.deleted).toEqual([]);
    expect(result.failed).toEqual([]);
  });

  it("handles empty staged map with files present", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");
    await write(templatePath, "original\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "modified",
        projectContent: "changed\n",
      }),
    ];

    const result = await pushChanges(files, new Map(), root);

    expect(result.written).toEqual([]);
    expect(result.failed).toEqual([]);
  });
});

describe("pushChanges — multiple hunks with partial staging", () => {
  it("applies only hunk 0 when hunk 1 is not staged", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "multi.txt");
    await write(templatePath, "one\ntwo\nthree\nfour\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "multi.txt",
        templatePath,
        status: "modified",
        projectContent: "ONE\ntwo\nTHREE\nfour\n",
        hunks: [
          {
            text: "@@ -1,2 +1,2 @@\n-one\n+ONE\n two",
            oldStart: 0,
            oldLines: 2,
            newStart: 0,
            newLines: 2,
          },
          {
            text: "@@ -3,2 +3,2 @@\n-three\n+THREE\n four",
            oldStart: 2,
            oldLines: 2,
            newStart: 2,
            newLines: 2,
          },
        ],
      }),
    ];
    const staged = new Map([["multi.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    expect(result.failed).toEqual([]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("ONE\ntwo\nthree\nfour\n");
  });

  it("applies only hunk 1 when hunk 0 is not staged", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "multi.txt");
    await write(templatePath, "one\ntwo\nthree\nfour\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "multi.txt",
        templatePath,
        status: "modified",
        projectContent: "ONE\ntwo\nTHREE\nfour\n",
        hunks: [
          {
            text: "@@ -1,2 +1,2 @@\n-one\n+ONE\n two",
            oldStart: 0,
            oldLines: 2,
            newStart: 0,
            newLines: 2,
          },
          {
            text: "@@ -3,2 +3,2 @@\n-three\n+THREE\n four",
            oldStart: 2,
            oldLines: 2,
            newStart: 2,
            newLines: 2,
          },
        ],
      }),
    ];
    const staged = new Map([["multi.txt", new Set([1])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("one\ntwo\nTHREE\nfour\n");
  });

  it("applies both hunks when both are staged", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "multi.txt");
    await write(templatePath, "one\ntwo\nthree\nfour\n");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "multi.txt",
        templatePath,
        status: "modified",
        projectContent: "ONE\ntwo\nTHREE\nfour\n",
        hunks: [
          {
            text: "@@ -1,2 +1,2 @@\n-one\n+ONE\n two",
            oldStart: 0,
            oldLines: 2,
            newStart: 0,
            newLines: 2,
          },
          {
            text: "@@ -3,2 +3,2 @@\n-three\n+THREE\n four",
            oldStart: 2,
            oldLines: 2,
            newStart: 2,
            newLines: 2,
          },
        ],
      }),
    ];
    const staged = new Map([["multi.txt", new Set([0, 1])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.written).toEqual([templatePath]);
    const content = await readFile(templatePath, "utf-8");
    expect(content).toBe("ONE\ntwo\nTHREE\nfour\n");
  });
});

describe("pushChanges — error paths", () => {
  it("captures mkdir failure when parent directory cannot be created", async () => {
    const root = await makeTempDir();
    // Use a path that will fail — a file as parent directory
    const fileAsDir = join(root, "template", "blocked");
    await write(fileAsDir, "i am a file\n");
    const templatePath = join(fileAsDir, "subdir", "new.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "new.txt",
        templatePath,
        status: "added",
        projectContent: "content\n",
      }),
    ];
    const staged = new Map([["new.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.path).toBe(templatePath);
    expect(result.written).toEqual([]);
  });

  it("captures non-Error thrown values", async () => {
    const root = await makeTempDir();
    const templatePath = join(root, "template", "file.txt");

    const files: SyncFile[] = [
      makeSyncFile({
        projectPath: "file.txt",
        templatePath,
        status: "deleted",
      }),
    ];
    const staged = new Map([["file.txt", new Set([0])]]);

    const result = await pushChanges(files, staged, root);

    expect(result.failed).toHaveLength(1);
    expect(typeof result.failed[0]?.error).toBe("string");
  });
});
