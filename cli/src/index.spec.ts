import { mkdtemp, mkdir, chmod, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { atomicCopyFile, expandMarkPath, fishCompletion } from "./helpers.js";

const tempRoots: string[] = [];

async function write(path: string, content: string): Promise<void> {
  await mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, content, "utf-8");
}

async function makeTempDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "hillbilly-index-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("atomicCopyFile", () => {
  it("copies file content correctly", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.txt");
    const dest = join(root, "dest.txt");
    await write(source, "hello world\n");

    await atomicCopyFile(source, dest);

    const content = await readFile(dest, "utf-8");
    expect(content).toBe("hello world\n");
  });

  it("fails when destination parent directory does not exist", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.txt");
    const dest = join(root, "deep", "nested", "dest.txt");
    await write(source, "content\n");

    await expect(atomicCopyFile(source, dest)).rejects.toThrow();
  });

  it("sets file mode when provided", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.sh");
    const dest = join(root, "dest.sh");
    await write(source, "#!/bin/bash\n");

    await atomicCopyFile(source, dest, 0o755);

    const info = await stat(dest);
    expect(info.mode & 0o777).toBe(0o755);
  });

  it("does not set mode when mode is undefined", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.txt");
    const dest = join(root, "dest.txt");
    await write(source, "content\n");

    await atomicCopyFile(source, dest);

    const info = await stat(dest);
    const defaultMode = info.mode & 0o777;
    expect(defaultMode).not.toBe(0o755);
  });

  it("overwrites existing destination file", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.txt");
    const dest = join(root, "dest.txt");
    await write(source, "new content\n");
    await write(dest, "old content\n");

    await atomicCopyFile(source, dest);

    const content = await readFile(dest, "utf-8");
    expect(content).toBe("new content\n");
  });

  it("leaves no .tmp file after successful copy", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.txt");
    const dest = join(root, "dest.txt");
    await write(source, "content\n");

    await atomicCopyFile(source, dest);

    await expect(readFile(`${dest}.tmp`, "utf-8")).rejects.toThrow();
  });

  it("fails when source file does not exist", async () => {
    const root = await makeTempDir();
    const source = join(root, "nonexistent.txt");
    const dest = join(root, "dest.txt");

    await expect(atomicCopyFile(source, dest)).rejects.toThrow();
  });

  it("copies binary content without corruption", async () => {
    const root = await makeTempDir();
    const source = join(root, "source.bin");
    const dest = join(root, "dest.bin");
    const binaryContent = new Uint8Array([0x00, 0xff, 0x80, 0x01, 0xfe]);
    await writeFile(source, binaryContent);

    await atomicCopyFile(source, dest);

    const destContent = await readFile(dest);
    expect(destContent).toEqual(Buffer.from(binaryContent));
  });
});

describe("expandMarkPath", () => {
  it("returns single file path as relative path", async () => {
    const root = await makeTempDir();
    const filePath = join(root, "src", "index.ts");
    await write(filePath, "content\n");

    const result = await expandMarkPath(root, filePath);

    expect(result).toEqual(["src/index.ts"]);
  });

  it("returns single file path with forward slashes", async () => {
    const root = await makeTempDir();
    const filePath = join(root, "src", "index.ts");
    await write(filePath, "content\n");

    const result = await expandMarkPath(root, filePath);

    expect(result[0]).not.toContain("\\");
  });

  it("expands directory to all file paths recursively", async () => {
    const root = await makeTempDir();
    await write(join(root, "src", "a.ts"), "a\n");
    await write(join(root, "src", "b.ts"), "b\n");
    await write(join(root, "src", "sub", "c.ts"), "c\n");

    const result = await expandMarkPath(root, join(root, "src"));

    // Paths are relative to projectRoot, not to the input directory
    expect(result).toContain("src/a.ts");
    expect(result).toContain("src/b.ts");
    expect(result).toContain("src/sub/c.ts");
    expect(result).toHaveLength(3);
  });

  it("returns empty array for empty directory", async () => {
    const root = await makeTempDir();
    const emptyDir = join(root, "empty");
    await mkdir(emptyDir, { recursive: true });

    const result = await expandMarkPath(root, emptyDir);

    expect(result).toEqual([]);
  });

  it("handles relative path input", async () => {
    const root = await makeTempDir();
    await write(join(root, "file.txt"), "content\n");

    const result = await expandMarkPath(root, "file.txt");
    expect(result).toEqual(["file.txt"]);
  });

  it("excludes directories from results", async () => {
    const root = await makeTempDir();
    await write(join(root, "src", "file.ts"), "content\n");
    await mkdir(join(root, "src", "empty-dir"), { recursive: true });

    const result = await expandMarkPath(root, join(root, "src"));

    expect(result).not.toContain("empty-dir");
    expect(result).not.toContain("src/empty-dir");
    expect(result).toEqual(["src/file.ts"]);
  });

  it("throws when path does not exist", async () => {
    const root = await makeTempDir();

    await expect(expandMarkPath(root, join(root, "nonexistent"))).rejects.toThrow();
  });

  it("handles deeply nested directory structure", async () => {
    const root = await makeTempDir();
    await write(join(root, "a", "b", "c", "d", "e.txt"), "deep\n");

    const result = await expandMarkPath(root, join(root, "a"));

    expect(result).toEqual(["a/b/c/d/e.txt"]);
  });

  it("handles mixed files and directories at same level", async () => {
    const root = await makeTempDir();
    await write(join(root, "top.txt"), "top\n");
    await write(join(root, "sub", "inner.txt"), "inner\n");
    await mkdir(join(root, "empty"), { recursive: true });

    const result = await expandMarkPath(root, root);

    expect(result).toContain("top.txt");
    expect(result).toContain("sub/inner.txt");
    expect(result).not.toContain("empty");
    expect(result).toHaveLength(2);
  });
});

describe("fishCompletion", () => {
  it("returns a non-empty string", () => {
    const result = fishCompletion();
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains fish completion syntax", () => {
    const result = fishCompletion();
    expect(result).toContain("complete -c hillbilly");
  });

  it("includes sync subcommand", () => {
    const result = fishCompletion();
    expect(result).toContain("-a sync");
  });

  it("includes push subcommand under sync", () => {
    const result = fishCompletion();
    expect(result).toContain("__fish_seen_subcommand_from sync");
    expect(result).toContain("-a push");
  });

  it("includes pull subcommand under sync", () => {
    const result = fishCompletion();
    expect(result).toContain("-a pull");
  });

  it("includes mark and unmark commands", () => {
    const result = fishCompletion();
    expect(result).toContain("-a mark");
    expect(result).toContain("-a unmark");
  });

  it("includes config subcommand group", () => {
    const result = fishCompletion();
    expect(result).toContain("-a config");
    expect(result).toContain("-a set-template");
    expect(result).toContain("-a doctor");
  });

  it("includes completion fish command", () => {
    const result = fishCompletion();
    expect(result).toContain("-a fish");
  });

  it("includes project option with file completion", () => {
    const result = fishCompletion();
    expect(result).toContain("-s p");
    expect(result).toContain("-l project");
    expect(result).toContain("-F");
  });

  it("includes template option with file completion", () => {
    const result = fishCompletion();
    expect(result).toContain("-s t");
    expect(result).toContain("-l template");
  });

  it("includes vcs-ref option for pull", () => {
    const result = fishCompletion();
    expect(result).toContain("-s r");
    expect(result).toContain("-l vcs-ref");
  });

  it("includes recopy flag for pull", () => {
    const result = fishCompletion();
    expect(result).toContain("-l recopy");
  });

  it("includes global flag for set-template", () => {
    const result = fishCompletion();
    expect(result).toContain("-l global");
  });

  it("includes template-subdir option for set-template", () => {
    const result = fishCompletion();
    expect(result).toContain("-l template-subdir");
  });

  it("produces consistent output on repeated calls", () => {
    const first = fishCompletion();
    const second = fishCompletion();
    expect(first).toBe(second);
  });
});
