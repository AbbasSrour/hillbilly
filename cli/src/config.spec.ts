import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  GLOBAL_CONFIG_PATH,
  PROJECT_CONFIG_NAME,
  projectConfigPath,
  readConfig,
  resolveProjectRoot,
  resolveTemplateRoot,
  writeConfig,
  writeTemplateConfig,
} from "./config.js";

const tempRoots: string[] = [];

async function write(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf-8");
}

async function makeTempDir(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "hillbilly-config-"));
  tempRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("projectConfigPath", () => {
  it("returns absolute path with config filename", () => {
    const result = projectConfigPath("/some/project");
    expect(result).toBe(join("/some", "project", PROJECT_CONFIG_NAME));
  });

  it("resolves relative paths to absolute", () => {
    const result = projectConfigPath("relative/path");
    expect(result).toBe(join(process.cwd(), "relative", "path", PROJECT_CONFIG_NAME));
  });

  it("handles single-dot path", () => {
    const result = projectConfigPath(".");
    expect(result).toBe(join(process.cwd(), PROJECT_CONFIG_NAME));
  });

  it("handles trailing slash", () => {
    const result = projectConfigPath("/some/project/");
    expect(result).toBe(join("/some", "project", PROJECT_CONFIG_NAME));
  });
});

describe("resolveProjectRoot", () => {
  it("finds root with .hillbilly.yml present", async () => {
    const root = await makeTempDir();
    const nested = join(root, "a", "b", "c");
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /some/repo\n");
    await mkdir(nested, { recursive: true });

    const result = resolveProjectRoot(nested);
    expect(result).toBe(root);
  });

  it("finds root with .copier-answers.yml present", async () => {
    const root = await makeTempDir();
    const nested = join(root, "src", "deep");
    await write(join(root, ".copier-answers.yml"), "project_name: demo\n");
    await mkdir(nested, { recursive: true });

    const result = resolveProjectRoot(nested);
    expect(result).toBe(root);
  });

  it("prefers .hillbilly.yml when both configs exist", async () => {
    const root = await makeTempDir();
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /repo\n");
    await write(join(root, ".copier-answers.yml"), "project_name: demo\n");

    const result = resolveProjectRoot(root);
    expect(result).toBe(root);
  });

  it("falls back to start path when no config found", async () => {
    const root = await makeTempDir();
    const nested = join(root, "empty", "dir");
    await mkdir(nested, { recursive: true });

    const result = resolveProjectRoot(nested);
    expect(result).toBe(nested);
  });

  it("stops at filesystem root when no config found", () => {
    const result = resolveProjectRoot("/tmp");
    expect(result).toBe("/tmp");
  });

  it("resolves relative start path before walking up", async () => {
    const root = await makeTempDir();
    const nested = join(root, "a", "b");
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /repo\n");
    await mkdir(nested, { recursive: true });

    process.chdir(nested);
    try {
      const result = resolveProjectRoot(".");
      expect(result).toBe(root);
    } finally {
      process.chdir(process.cwd());
    }
  });

  it("finds config in immediate directory", async () => {
    const root = await makeTempDir();
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /repo\n");

    const result = resolveProjectRoot(root);
    expect(result).toBe(root);
  });

  it("finds nearest config when nested configs exist", async () => {
    const root = await makeTempDir();
    const inner = join(root, "inner");
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /outer\n");
    await write(join(inner, PROJECT_CONFIG_NAME), "templateRepo: /inner\n");

    const result = resolveProjectRoot(join(inner, "src"));
    expect(result).toBe(inner);
  });
});

describe("readConfig", () => {
  it("returns null for missing file", async () => {
    const root = await makeTempDir();
    const result = await readConfig(join(root, "nonexistent.yml"));
    expect(result).toBeNull();
  });

  it("parses valid YAML with all fields", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(
      configPath,
      `templateRepo: /some/repo
templateSubdir: src
tui:
  theme: dark
  diffView: split
  diffLineColors: true
  diffSigns: true
  showLineNumbers: false
`,
    );

    const result = await readConfig(configPath);
    expect(result).toEqual({
      templateRepo: "/some/repo",
      templateSubdir: "src",
      tui: {
        theme: "dark",
        diffView: "split",
        diffLineColors: true,
        diffSigns: true,
        showLineNumbers: false,
      },
    });
  });

  it("returns empty object for empty YAML file", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "");

    const result = await readConfig(configPath);
    expect(result).toEqual({});
  });

  it("returns empty object for YAML with only whitespace", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "   \n\n  \n");

    const result = await readConfig(configPath);
    expect(result).toEqual({});
  });

  it("returns empty object for YAML with only comments", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "# just a comment\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({});
  });

  it("parses partial config with only templateRepo", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "templateRepo: /some/repo\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({ templateRepo: "/some/repo" });
  });

  it("parses partial config with only tui settings", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "tui:\n  theme: light\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({ tui: { theme: "light" } });
  });

  it("ignores unknown YAML keys", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "templateRepo: /repo\nunknownKey: value\n");

    const result = await readConfig(configPath);
    expect(result).toHaveProperty("templateRepo", "/repo");
    expect(result).toHaveProperty("unknownKey", "value");
  });

  it("handles YAML with null value", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "null\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({});
  });

  it("reads config from nested directory path", async () => {
    const root = await makeTempDir();
    const configPath = join(root, "deep", "nested", "dir", PROJECT_CONFIG_NAME);
    await write(configPath, "templateRepo: /repo\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({ templateRepo: "/repo" });
  });

  it("parses YAML with templateSubdir only", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "templateSubdir: custom-template\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({ templateSubdir: "custom-template" });
  });

  it("handles tui with partial settings", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "tui:\n  diffView: unified\n");

    const result = await readConfig(configPath);
    expect(result).toEqual({ tui: { diffView: "unified" } });
  });
});

describe("writeConfig", () => {
  it("creates parent directories automatically", async () => {
    const root = await makeTempDir();
    const configPath = join(root, "a", "b", "c", PROJECT_CONFIG_NAME);

    await writeConfig(configPath, { templateRepo: "/repo" });

    const content = await readFile(configPath, "utf-8");
    expect(content).toContain("templateRepo: /repo");
  });

  it("writes valid YAML that can be read back", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    const config = {
      templateRepo: "/some/repo",
      templateSubdir: "template",
      tui: { theme: "dark", diffView: "split" as const },
    };

    await writeConfig(configPath, config);
    const result = await readConfig(configPath);

    expect(result).toEqual(config);
  });

  it("writes partial config with only templateRepo", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeConfig(configPath, { templateRepo: "/repo" });

    const content = await readFile(configPath, "utf-8");
    expect(content).toContain("templateRepo: /repo");
    expect(content).not.toContain("templateSubdir");
  });

  it("writes partial config with only tui", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeConfig(configPath, { tui: { theme: "light" } });

    const result = await readConfig(configPath);
    expect(result).toEqual({ tui: { theme: "light" } });
  });

  it("overwrites existing file", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "templateRepo: /old\n");

    await writeConfig(configPath, { templateRepo: "/new" });

    const result = await readConfig(configPath);
    expect(result).toEqual({ templateRepo: "/new" });
  });

  it("writes empty config as empty YAML", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeConfig(configPath, {});

    const content = await readFile(configPath, "utf-8");
    expect(content.trim()).toBe("{}");
  });

  it("writes config with all tui options", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    const config = {
      tui: {
        theme: "custom",
        diffView: "unified" as const,
        diffLineColors: true,
        diffSigns: false,
        showLineNumbers: true,
      },
    };

    await writeConfig(configPath, config);
    const result = await readConfig(configPath);
    expect(result).toEqual(config);
  });
});

describe("resolveTemplateRoot", () => {
  it("uses CLI option first when provided", async () => {
    const root = await makeTempDir();
    const cliTemplate = join(root, "cli-template");
    await mkdir(cliTemplate, { recursive: true });
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: /other/repo\n");

    const result = await resolveTemplateRoot(root, { template: cliTemplate });

    expect(result).toEqual({
      templateRoot: cliTemplate,
      source: "cli",
    });
  });

  it("resolves CLI template path to absolute", async () => {
    const root = await makeTempDir();
    const cliTemplate = join(root, "cli-template");
    await mkdir(cliTemplate, { recursive: true });

    process.chdir(root);
    try {
      const result = await resolveTemplateRoot(".", { template: "cli-template" });
      expect(result.templateRoot).toBe(cliTemplate);
      expect(result.source).toBe("cli");
    } finally {
      process.chdir(process.cwd());
    }
  });

  it("uses project config when CLI option not provided", async () => {
    const root = await makeTempDir();
    const templateDir = join(root, "my-template", "template");
    await mkdir(templateDir, { recursive: true });
    await write(
      join(root, PROJECT_CONFIG_NAME),
      `templateRepo: ${root}/my-template\ntemplateSubdir: template\n`,
    );

    const result = await resolveTemplateRoot(root);

    expect(result).toEqual({
      templateRoot: templateDir,
      source: "project-config",
      configPath: join(root, PROJECT_CONFIG_NAME),
    });
  });

  it("falls back to repo root when subdir does not exist", async () => {
    const root = await makeTempDir();
    const repoDir = join(root, "my-repo");
    await mkdir(repoDir, { recursive: true });
    await write(join(root, PROJECT_CONFIG_NAME), `templateRepo: ${repoDir}\n`);

    const result = await resolveTemplateRoot(root);

    expect(result.templateRoot).toBe(repoDir);
    expect(result.source).toBe("project-config");
  });

  it("uses global config when project config has no template", async () => {
    const root = await makeTempDir();
    const globalDir = dirname(GLOBAL_CONFIG_PATH);
    const templateDir = join(root, "global-template", "template");
    await mkdir(templateDir, { recursive: true });

    await write(GLOBAL_CONFIG_PATH, `templateRepo: ${join(root, "global-template")}\n`);
    await write(join(root, PROJECT_CONFIG_NAME), "tui:\n  theme: dark\n");

    try {
      const result = await resolveTemplateRoot(root);

      expect(result).toEqual({
        templateRoot: templateDir,
        source: "global-config",
        configPath: GLOBAL_CONFIG_PATH,
      });
    } finally {
      await rm(GLOBAL_CONFIG_PATH, { force: true });
    }
  });

  it("uses copier answers when no config files exist", async () => {
    const root = await makeTempDir();
    const templateDir = join(root, "copier-template", "template");
    await mkdir(templateDir, { recursive: true });
    await write(
      join(root, ".copier-answers.yml"),
      `_src_path: ${join(root, "copier-template")}\nproject_name: demo\n`,
    );

    const result = await resolveTemplateRoot(root);

    expect(result).toEqual({
      templateRoot: templateDir,
      source: "copier",
    });
  });

  it("falls back to copier source root when template subdir missing", async () => {
    const root = await makeTempDir();
    const sourceDir = join(root, "copier-source");
    await mkdir(sourceDir, { recursive: true });
    await write(join(root, ".copier-answers.yml"), `_src_path: ${sourceDir}\nproject_name: demo\n`);

    const result = await resolveTemplateRoot(root);

    expect(result.templateRoot).toBe(sourceDir);
    expect(result.source).toBe("copier");
  });

  it("throws when no template source found", async () => {
    const root = await makeTempDir();
    await mkdir(join(root, "empty"), { recursive: true });

    await expect(resolveTemplateRoot(join(root, "empty"))).rejects.toThrow(
      /No Hillbilly template source found/,
    );
  });

  it("throws with helpful error message", async () => {
    const root = await makeTempDir();

    await expect(resolveTemplateRoot(root)).rejects.toThrow(/hillbilly config set-template/);
  });

  it("includes resolved project root in error message", async () => {
    const root = await makeTempDir();

    try {
      await resolveTemplateRoot(root);
    } catch (error) {
      expect((error as Error).message).toContain(root);
    }
  });

  it("prefers project config over copier answers", async () => {
    const root = await makeTempDir();
    const projectTemplate = join(root, "project-template", "template");
    const copierTemplate = join(root, "copier-template", "template");
    await mkdir(projectTemplate, { recursive: true });
    await mkdir(copierTemplate, { recursive: true });
    await write(
      join(root, PROJECT_CONFIG_NAME),
      `templateRepo: ${join(root, "project-template")}\n`,
    );
    await write(join(root, ".copier-answers.yml"), `_src_path: ${join(root, "copier-template")}\n`);

    const result = await resolveTemplateRoot(root);

    expect(result.source).toBe("project-config");
    expect(result.templateRoot).toBe(projectTemplate);
  });

  it("skips project config when it exists but has no templateRepo", async () => {
    const root = await makeTempDir();
    const copierTemplate = join(root, "copier-template", "template");
    await mkdir(copierTemplate, { recursive: true });
    await write(join(root, PROJECT_CONFIG_NAME), "tui:\n  theme: dark\n");
    await write(join(root, ".copier-answers.yml"), `_src_path: ${join(root, "copier-template")}\n`);

    const result = await resolveTemplateRoot(root);

    expect(result.source).toBe("copier");
    expect(result.templateRoot).toBe(copierTemplate);
  });

  it("resolves project config templateRepo relative to project root", async () => {
    const root = await makeTempDir();
    const templateDir = join(root, "relative-template", "template");
    await mkdir(templateDir, { recursive: true });
    await write(join(root, PROJECT_CONFIG_NAME), "templateRepo: ./relative-template\n");

    const result = await resolveTemplateRoot(root);

    expect(result.templateRoot).toBe(templateDir);
    expect(result.source).toBe("project-config");
  });

  it("handles project config with templateSubdir defaulting to template", async () => {
    const root = await makeTempDir();
    const templateDir = join(root, "my-repo", "template");
    await mkdir(templateDir, { recursive: true });
    await write(join(root, PROJECT_CONFIG_NAME), `templateRepo: ${join(root, "my-repo")}\n`);

    const result = await resolveTemplateRoot(root);

    expect(result.templateRoot).toBe(templateDir);
  });

  it("uses custom templateSubdir from project config", async () => {
    const root = await makeTempDir();
    const templateDir = join(root, "my-repo", "custom");
    await mkdir(templateDir, { recursive: true });
    await write(
      join(root, PROJECT_CONFIG_NAME),
      `templateRepo: ${join(root, "my-repo")}\ntemplateSubdir: custom\n`,
    );

    const result = await resolveTemplateRoot(root);

    expect(result.templateRoot).toBe(templateDir);
    expect(result.configPath).toBe(join(root, PROJECT_CONFIG_NAME));
  });
});

describe("writeTemplateConfig", () => {
  it("creates new config file with templateRepo and templateSubdir", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeTemplateConfig(configPath, "/some/repo", "custom");

    const result = await readConfig(configPath);
    expect(result).toEqual({
      templateRepo: "/some/repo",
      templateSubdir: "custom",
    });
  });

  it("defaults templateSubdir to 'template'", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeTemplateConfig(configPath, "/some/repo");

    const result = await readConfig(configPath);
    expect(result?.templateSubdir).toBe("template");
  });

  it("merges with existing config preserving other keys", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "tui:\n  theme: dark\n");

    await writeTemplateConfig(configPath, "/new/repo");

    const result = await readConfig(configPath);
    expect(result).toEqual({
      tui: { theme: "dark" },
      templateRepo: "/new/repo",
      templateSubdir: "template",
    });
  });

  it("overwrites existing templateRepo", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "templateRepo: /old/repo\ntemplateSubdir: old-subdir\n");

    await writeTemplateConfig(configPath, "/new/repo", "new-subdir");

    const result = await readConfig(configPath);
    expect(result?.templateRepo).toBe("/new/repo");
    expect(result?.templateSubdir).toBe("new-subdir");
  });

  it("preserves existing tui config when updating template", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "tui:\n  theme: light\n  diffView: split\n  showLineNumbers: true\n");

    await writeTemplateConfig(configPath, "/repo");

    const result = await readConfig(configPath);
    expect(result?.tui).toEqual({
      theme: "light",
      diffView: "split",
      showLineNumbers: true,
    });
    expect(result?.templateRepo).toBe("/repo");
  });

  it("resolves relative templateRepo to absolute path", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    process.chdir(root);
    try {
      await writeTemplateConfig(configPath, "./relative-repo");

      const result = await readConfig(configPath);
      expect(result?.templateRepo).toBe(join(root, "relative-repo"));
    } finally {
      process.chdir(process.cwd());
    }
  });

  it("creates parent directories for config file", async () => {
    const root = await makeTempDir();
    const configPath = join(root, "nested", "dir", PROJECT_CONFIG_NAME);

    await writeTemplateConfig(configPath, "/repo");

    const content = await readFile(configPath, "utf-8");
    expect(content).toContain("templateRepo: /repo");
  });

  it("handles empty existing config file", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "");

    await writeTemplateConfig(configPath, "/repo");

    const result = await readConfig(configPath);
    expect(result?.templateRepo).toBe("/repo");
    expect(result?.templateSubdir).toBe("template");
  });

  it("handles missing existing config file", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeTemplateConfig(configPath, "/repo");

    const result = await readConfig(configPath);
    expect(result?.templateRepo).toBe("/repo");
  });

  it("preserves unrelated custom keys in existing config", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);
    await write(configPath, "customKey: customValue\nanotherKey: 123\n");

    await writeTemplateConfig(configPath, "/repo");

    const result = await readConfig(configPath);
    expect(result).toHaveProperty("customKey", "customValue");
    expect(result).toHaveProperty("anotherKey", 123);
    expect(result?.templateRepo).toBe("/repo");
  });

  it("writes valid YAML that round-trips correctly", async () => {
    const root = await makeTempDir();
    const configPath = join(root, PROJECT_CONFIG_NAME);

    await writeTemplateConfig(configPath, "/some/repo", "my-subdir");
    const written = await readConfig(configPath);

    expect(written).toEqual({
      templateRepo: "/some/repo",
      templateSubdir: "my-subdir",
    });
  });
});
