import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { pushChanges } from "../src/push.js";
import { applyStagedHunks, scan } from "../src/scan.js";

const tempRoots: string[] = [];

async function makeTempProject(): Promise<{ root: string; project: string; template: string }> {
  const root = await mkdtemp(join(tmpdir(), "hillbilly-scan-"));
  tempRoots.push(root);
  const project = join(root, "project");
  const template = join(root, "template");
  await mkdir(project, { recursive: true });
  await mkdir(template, { recursive: true });
  await writeFile(join(project, ".copier-answers.yml"), "project_name: demo\n", "utf-8");
  return { root, project, template };
}

async function write(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf-8");
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("scan", () => {
  it("discovers template files without markers and renders .jinja files for comparison", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, ".gitignore"), "dist\n");
    await write(join(project, ".gitignore"), "dist\n/build\n");
    await write(join(template, "tsconfig.json.jinja"), '{ "name": "[[ project_name ]]" }\n');
    await write(join(project, "tsconfig.json"), '{ "name": "demo" }\n');

    const result = await scan(project, { template });

    expect(result.projectRoot).toBe(project);
    expect(result.templateRoot).toBe(template);
    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "modified:.gitignore",
    ]);
  });

  it("excludes runtime/generated/tool-owned files but keeps inlang settings.json", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "bin/parser.worker.js"), "worker");
    await write(join(template, "apps/client/src/i18n/generated/messages.ts"), "generated");
    await write(join(template, "apps/client/paraglide/runtime.js"), "generated");
    await write(join(template, "apps/client/project.inlang/.gitignore"), "*\n!settings.json");
    await write(join(template, "apps/client/project.inlang/.meta.json"), "{}\n");
    await write(join(template, "apps/client/project.inlang/README.md"), "docs\n");
    await write(join(template, ".env.local"), "SECRET=1\n");
    await write(join(template, "packages/sdk/openapi.json"), "{}\n");
    await write(join(template, "packages/sdk/src/models/user.ts"), "generated\n");
    await write(join(template, "apps/client/project.inlang/settings.json"), "template settings\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual([
      "apps/client/project.inlang/settings.json",
    ]);
    expect(result.files[0]?.status).toBe("deleted");
  });

  it("reports deleted, modified, and manifest-tracked project-added files", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "deleted.txt"), "template\n");
    await write(join(template, "modified.txt"), "before\n");
    await write(join(project, "modified.txt"), "after\n");
    await write(join(project, "extra.txt"), "project only\n");
    await write(
      join(project, "hillbilly.yml"),
      "version: 1\nfiles:\n- path: extra.txt\n  state: tracked\n- path: deleted.txt\n  state: untracked\n",
    );

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "modified:modified.txt",
      "added:extra.txt",
    ]);
  });

  it("detects project-side file moves by exact content match", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "patches/patch-nest-start.cjs"), "module.exports = {}\n");
    await write(
      join(project, "apps/backend/patches/patch-nest-start.cjs"),
      "module.exports = {}\n",
    );

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "moved:apps/backend/patches/patch-nest-start.cjs",
    ]);
    expect(result.files[0]?.movedFrom).toBe("patches/patch-nest-start.cjs");
  });

  it("detects project-side file renames separately from moves", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "patches/patch-nest-start.cjs"), "module.exports = {}\n");
    await write(join(project, "patches/patch-nest-start-renamed.cjs"), "module.exports = {}\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "renamed:patches/patch-nest-start-renamed.cjs",
    ]);
    expect(result.files[0]?.movedFrom).toBe("patches/patch-nest-start.cjs");
  });

  it("pushes detected renames by writing the new template path and deleting the old one", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "patches/patch-nest-start.cjs"), "module.exports = {}\n");
    await write(
      join(project, "apps/backend/patches/patch-nest-start.cjs"),
      "module.exports = {}\n",
    );

    const result = await scan(project, { template });
    await pushChanges(
      result.files,
      new Map([["apps/backend/patches/patch-nest-start.cjs", new Set([0])]]),
      template,
      "demo",
    );

    await expect(
      readFile(join(template, "apps/backend/patches/patch-nest-start.cjs"), "utf-8"),
    ).resolves.toBe("module.exports = {}\n");
    await expect(
      readFile(join(template, "patches/patch-nest-start.cjs"), "utf-8"),
    ).rejects.toThrow();
  });

  it("parses comma hunk headers and applies no-newline metadata safely", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, ".vite-hooks/pre-commit"), "npx lint-staged");
    await write(join(project, ".vite-hooks/pre-commit"), "vp staged");

    const result = await scan(project, { template });
    const file = result.files.find((entry) => entry.projectPath === ".vite-hooks/pre-commit");

    expect(file?.status).toBe("modified");
    expect(file?.hunks).toHaveLength(1);
    expect(file?.hunks?.[0]?.text).toContain("\\ No newline at end of file");

    const templateContent = await readFile(join(template, ".vite-hooks/pre-commit"), "utf-8");
    const pushed = applyStagedHunks(templateContent, file?.hunks ?? [], new Set([0]));
    expect(pushed).toBe("vp staged");
  });

  it("applies only selected hunks without leaking unselected changes", async () => {
    const { project, template } = await makeTempProject();
    const middle = Array.from({ length: 20 }, (_, i) => `keep-${i}`).join("\n");
    await write(join(template, "multi.txt"), `one\n${middle}\ntwo\n`);
    await write(join(project, "multi.txt"), `ONE\n${middle}\nTWO\n`);

    const result = await scan(project, { template });
    const file = result.files.find((entry) => entry.projectPath === "multi.txt");

    expect(file?.hunks).toHaveLength(2);
    const pushed = applyStagedHunks(`one\n${middle}\ntwo\n`, file?.hunks ?? [], new Set([0]));
    expect(pushed).toBe(`ONE\n${middle}\ntwo\n`);
  });

  it("detects moved-plus-renamed (both directory and name change)", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "patches/patch-nest-start.cjs"), "module.exports = {}\n");
    await write(
      join(project, "apps/backend/patches/patch-nest-renamed.cjs"),
      "module.exports = {}\n",
    );

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "moved:apps/backend/patches/patch-nest-renamed.cjs",
    ]);
    expect(result.files[0]?.movedFrom).toBe("patches/patch-nest-start.cjs");
  });

  it("resolves .jinja template file when bare version does not exist", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "config.json.jinja"), '{"name": "[[ project_name ]]"}\n');

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual(["config.json"]);
    expect(result.files[0]?.status).toBe("deleted");
  });

  it("prefers bare template file over .jinja when both exist", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "config.json"), "bare version\n");
    await write(join(template, "config.json.jinja"), "jinja version\n");
    await write(join(project, "config.json"), "project version\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "modified:config.json",
    ]);
  });

  it("excludes .env with no suffix", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, ".env"), "SECRET=1\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual([]);
  });

  it("excludes secret .env variants but keeps .env.example", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, ".env.production"), "PROD=1\n");
    await write(join(template, ".env.example"), "EXAMPLE=1\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual([".env.example"]);
    expect(result.files[0]?.status).toBe("deleted");
  });

  it("excludes .log files at any depth", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "debug.log"), "log\n");
    await write(join(template, "deep/nested/app.log"), "log\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual([]);
  });

  it("excludes project.inlang/ subpaths at any depth but keeps settings.json", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "project.inlang/cache.json"), "{}\n");
    await write(join(template, "project.inlang/settings.json"), "{}\n");
    await write(join(template, "deep/project.inlang/meta.json"), "{}\n");

    const result = await scan(project, { template });

    // Only settings.json survives — all other project.inlang/ files are excluded
    expect(result.files.map((file) => file.projectPath)).toEqual(["project.inlang/settings.json"]);
  });

  it("excludes files with same basename in different directories independently", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "a/index.ts"), "a content\n");
    await write(join(template, "b/index.ts"), "b content\n");
    await write(join(project, "a/index.ts"), "a content\n");
    await write(join(project, "b/index.ts"), "b MODIFIED\n");

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "modified:b/index.ts",
    ]);
  });

  it("does not report files with identical content", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "same.txt"), "identical\n");
    await write(join(project, "same.txt"), "identical\n");

    const result = await scan(project, { template });

    expect(result.files).toEqual([]);
  });

  it("marks quote and whitespace style changes as format-only while keeping them changed", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "seed.ts"), 'import { Seeder } from "@mikro-orm/seeder";\n');
    await write(join(project, "seed.ts"), "import { Seeder } from '@mikro-orm/seeder'\n");

    const result = await scan(project, { template });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.status).toBe("modified");
    expect(result.files[0]?.formatOnly).toBe(true);
  });

  it("marks trailing whitespace and newline differences as format-only", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "code.ts"), "const x = 1;  \nconst y = 2;\n");
    await write(join(project, "code.ts"), "const x = 1;\nconst y = 2;\n");

    const result = await scan(project, { template });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.formatOnly).toBe(true);
  });

  it("marks CRLF vs LF as format-only", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "code.ts"), "const x = 1;\nconst y = 2;\n");
    await write(join(project, "code.ts"), "const x = 1;\r\nconst y = 2;\r\n");

    const result = await scan(project, { template });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.formatOnly).toBe(true);
  });

  it("does NOT mark real content changes as format-only", async () => {
    const { project, template } = await makeTempProject();
    await write(
      join(template, "user.service.ts"),
      "export class UserService {\n  findOne(id: number) {\n    return this.repo.findOne(id);\n  }\n}\n",
    );
    await write(
      join(project, "user.service.ts"),
      "export class UserService {\n  findOne(id: number) {\n    return this.repo.findById(id);\n  }\n}\n",
    );

    const result = await scan(project, { template });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.status).toBe("modified");
    expect(result.files[0]?.formatOnly).toBeFalsy();
  });

  it("does NOT mark structural changes as format-only", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "config.ts"), "const port = 3000;\nconst host = 'localhost';\n");
    await write(join(project, "config.ts"), "const port = 8080;\nconst host = 'localhost';\n");

    const result = await scan(project, { template });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.formatOnly).toBeFalsy();
  });
});

describe("applyStagedHunks edge cases", () => {
  it("returns template unchanged when staged set is empty", () => {
    const template = "line1\nline2\nline3\n";
    const hunks = [
      {
        text: "@@ -1,3 +1,3 @@\n-line1\n+NEW1\n line2\n-line3\n+NEW3",
        oldStart: 0,
        oldLines: 3,
        newStart: 0,
        newLines: 3,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set());

    expect(result).toBe("line1\nline2\nline3\n");
  });

  it("handles hunk header with 0 old lines (insertion at start)", () => {
    const template = "line1\nline2\n";
    const hunks = [
      { text: "@@ -0,0 +1,2 @@\n+NEW1\n+NEW2", oldStart: 0, oldLines: 0, newStart: 0, newLines: 2 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("NEW1\nNEW2\nline1\nline2\n");
  });

  it("handles hunk header with 0 new lines (deletion only)", () => {
    const template = "line1\nline2\nline3\n";
    const hunks = [
      { text: "@@ -2,1 +2,0 @@\n-line2", oldStart: 1, oldLines: 1, newStart: 1, newLines: 0 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("line1\nline3\n");
  });

  it("handles lines that are just + (empty added line)", () => {
    const template = "line1\nline2\n";
    const hunks = [
      {
        text: "@@ -1,2 +1,3 @@\n line1\n+\n line2",
        oldStart: 0,
        oldLines: 2,
        newStart: 0,
        newLines: 3,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("line1\n\nline2\n");
  });

  it("handles lines that are just - (empty removed line)", () => {
    const template = "line1\n\nline2\n";
    const hunks = [
      {
        text: "@@ -1,3 +1,2 @@\n line1\n-\n line2",
        oldStart: 0,
        oldLines: 3,
        newStart: 0,
        newLines: 2,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("line1\nline2\n");
  });

  it("handles context lines without leading space", () => {
    const template = "line1\nline2\n";
    const hunks = [
      {
        text: "@@ -1,2 +1,2 @@\n-line1\n+NEW1\nline2",
        oldStart: 0,
        oldLines: 2,
        newStart: 0,
        newLines: 2,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("NEW1\nline2\n");
  });

  it("handles out-of-order staged indices correctly", () => {
    const template = "one\ntwo\nthree\nfour\n";
    const hunks = [
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
    ];

    const result = applyStagedHunks(template, hunks, new Set([1, 0]));

    expect(result).toBe("ONE\ntwo\nTHREE\nfour\n");
  });

  it("applies hunks in reverse order to avoid index shifting", () => {
    const template = "a\nb\nc\nd\n";
    const hunks = [
      { text: "@@ -1,2 +1,2 @@\n-a\n+A\n b", oldStart: 0, oldLines: 2, newStart: 0, newLines: 2 },
      { text: "@@ -3,2 +3,2 @@\n-c\n+C\n d", oldStart: 2, oldLines: 2, newStart: 2, newLines: 2 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0, 1]));

    expect(result).toBe("A\nb\nC\nd\n");
  });

  it("skips diff metadata lines starting with backslash", () => {
    const template = "content without newline";
    const hunks = [
      {
        text: "@@ -1,1 +1,1 @@\n-content without newline\n+new content\n\\ No newline at end of file",
        oldStart: 0,
        oldLines: 1,
        newStart: 0,
        newLines: 1,
        newNoNewline: true,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("new content");
  });

  it("adds trailing newline when hunk adds it to a file without one", () => {
    const template = '{\n  "extends": "@hillbilly/tsconfig/base.json"\n}';
    const hunks = [
      {
        text: '@@ -1,3 +1,3 @@\n {\n   "extends": "@hillbilly/tsconfig/base.json"\n-}\n+}',
        oldStart: 0,
        oldLines: 3,
        newStart: 0,
        newLines: 3,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe('{\n  "extends": "@hillbilly/tsconfig/base.json"\n}\n');
  });

  it("removes trailing newline when new side has no-newline marker", () => {
    const template = "line1\nline2\n";
    const hunks = [
      {
        text: "@@ -2,1 +2,1 @@\n-line2\n+line2\n\\ No newline at end of file",
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 1,
        newNoNewline: true,
      },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("line1\nline2");
  });

  it("handles single-line template with full replacement", () => {
    const template = "old\n";
    const hunks = [
      { text: "@@ -1,1 +1,1 @@\n-old\n+new", oldStart: 0, oldLines: 1, newStart: 0, newLines: 1 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("new\n");
  });

  it("handles empty template with insertion", () => {
    const template = "";
    const hunks = [
      { text: "@@ -0,0 +1,1 @@\n+new line", oldStart: 0, oldLines: 0, newStart: 0, newLines: 1 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0]));

    expect(result).toBe("new line\n");
  });

  it("handles multiple hunks at same location", () => {
    const template = "keep\n";
    const hunks = [
      { text: "@@ -0,0 +1,1 @@\n+before", oldStart: 0, oldLines: 0, newStart: 0, newLines: 1 },
      { text: "@@ -1,0 +2,1 @@\n+after", oldStart: 1, oldLines: 0, newStart: 1, newLines: 1 },
    ];

    const result = applyStagedHunks(template, hunks, new Set([0, 1]));

    // Hunks applied in reverse order: hunk 1 inserts "after" at index 1,
    // then hunk 0 inserts "before" at index 0 → "before\nkeep\nafter\n"
    expect(result).toBe("before\nkeep\nafter\n");
  });
});

describe("renderSimpleCopierVariables through scan", () => {
  it("leaves [[ unknown_key ]] unchanged when key is missing", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, "config.json.jinja"), '{"name": "[[ missing_key ]]"}\n');

    const result = await scan(project, { template });

    expect(result.files.map((file) => file.projectPath)).toEqual(["config.json"]);
    expect(result.files[0]?.status).toBe("deleted");
    expect(result.files[0]?.templateContent).toContain("[[ missing_key ]]");
  });

  it("leaves [[ key ]] unchanged when value is an object", async () => {
    const { project, template } = await makeTempProject();
    await writeFile(
      join(project, ".copier-answers.yml"),
      "project_name: demo\nnested:\n  key: value\n",
      "utf-8",
    );
    await write(join(template, "config.json.jinja"), '{"name": "[[ nested ]]"}\n');

    const result = await scan(project, { template });

    const file = result.files.find((f) => f.projectPath === "config.json");
    expect(file?.status).toBe("deleted");
    expect(file?.templateContent).toContain("[[ nested ]]");
  });

  it("leaves [[ key ]] unchanged when value is an array", async () => {
    const { project, template } = await makeTempProject();
    await writeFile(
      join(project, ".copier-answers.yml"),
      "project_name: demo\nitems:\n  - one\n  - two\n",
      "utf-8",
    );
    await write(join(template, "config.json.jinja"), '{"items": "[[ items ]]"}\n');

    const result = await scan(project, { template });

    const file = result.files.find((f) => f.projectPath === "config.json");
    expect(file?.status).toBe("deleted");
    expect(file?.templateContent).toContain("[[ items ]]");
  });

  it("renders boolean Copier variables", async () => {
    const { project, template } = await makeTempProject();
    await writeFile(
      join(project, ".copier-answers.yml"),
      "project_name: demo\nuse_typescript: true\n",
      "utf-8",
    );
    await write(join(template, "config.json.jinja"), '{"ts": [[ use_typescript ]]}\n');
    await write(join(project, "config.json"), '{"ts": true}\n');

    const result = await scan(project, { template });

    expect(result.files).toEqual([]);
  });

  it("renders numeric Copier variables", async () => {
    const { project, template } = await makeTempProject();
    await writeFile(
      join(project, ".copier-answers.yml"),
      "project_name: demo\nport: 3000\n",
      "utf-8",
    );
    await write(join(template, "config.json.jinja"), '{"port": [[ port ]]}\n');
    await write(join(project, "config.json"), '{"port": 3000}\n');

    const result = await scan(project, { template });

    expect(result.files).toEqual([]);
  });

  it("handles nested [[ ]] without rendering inner brackets", async () => {
    const { project, template } = await makeTempProject();
    await writeFile(join(project, ".copier-answers.yml"), "project_name: demo\n", "utf-8");
    await write(
      join(template, "config.json.jinja"),
      '{"val": "[[ not_a_key ]] [[ project_name ]]"}\n',
    );
    await write(join(project, "config.json"), '{"val": "[[ not_a_key ]] demo"}\n');

    const result = await scan(project, { template });

    expect(result.files).toEqual([]);
  });
});
