import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyStagedHunks, scan } from "./scan.js";

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
      join(project, ".hillbilly-sync.yml"),
      "version: 1\nfiles:\n- path: extra.txt\n  state: tracked\n- path: deleted.txt\n  state: untracked\n",
    );

    const result = await scan(project, { template });

    expect(result.files.map((file) => `${file.status}:${file.projectPath}`)).toEqual([
      "modified:modified.txt",
      "added:extra.txt",
      "added:.hillbilly-sync.yml",
    ]);
  });

  it("parses comma hunk headers and applies no-newline metadata safely", async () => {
    const { project, template } = await makeTempProject();
    await write(join(template, ".vite-hooks/pre-commit"), "npx lint-staged");
    await write(join(project, ".vite-hooks/pre-commit"), "vp lint-staged");

    const result = await scan(project, { template });
    const file = result.files.find((entry) => entry.projectPath === ".vite-hooks/pre-commit");

    expect(file?.status).toBe("modified");
    expect(file?.hunks).toHaveLength(1);
    expect(file?.hunks?.[0]?.text).toContain("\\ No newline at end of file");

    const templateContent = await readFile(join(template, ".vite-hooks/pre-commit"), "utf-8");
    const pushed = applyStagedHunks(templateContent, file?.hunks ?? [], new Set([0]));
    expect(pushed).toBe("vp lint-staged");
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
});
