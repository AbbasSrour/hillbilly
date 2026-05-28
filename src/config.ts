import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export interface HillbillyConfig {
  templateRepo?: string;
  templateSubdir?: string;
  tui?: {
    theme?: string;
    diffView?: "unified" | "split";
    diffLineColors?: boolean;
    diffSigns?: boolean;
    showLineNumbers?: boolean;
    diffWrap?: boolean;
  };
}

export interface TemplateResolution {
  templateRoot: string;
  source: "cli" | "project-config" | "copier";
  configPath?: string;
}

export const PROJECT_CONFIG_NAME = "hillbilly.yml";

export function projectConfigPath(projectRoot: string): string {
  return resolve(projectRoot, PROJECT_CONFIG_NAME);
}

export function resolveProjectRoot(startPath: string): string {
  let current = resolve(startPath);

  while (true) {
    if (existsSync(resolve(current, PROJECT_CONFIG_NAME))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) return resolve(startPath);
    current = parent;
  }
}

// ---------------------------------------------------------------------------
// Merged project file (hillbilly.yml) — contains Copier answers + hillbilly
// config + TUI settings + sync manifest
// ---------------------------------------------------------------------------

async function readMergedFile(projectRoot: string): Promise<Record<string, unknown> | null> {
  const path = projectConfigPath(projectRoot);
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf-8");
  const parsed = parseYaml(raw);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : null;
}

async function writeMergedFile(projectRoot: string, data: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(projectConfigPath(projectRoot)), { recursive: true });
  await writeFile(projectConfigPath(projectRoot), stringifyYaml(data), "utf-8");
}

// ---------------------------------------------------------------------------
// Project config (templateRepo, templateSubdir, tui)
// ---------------------------------------------------------------------------

export async function readProjectConfig(projectRoot: string): Promise<HillbillyConfig> {
  const merged = await readMergedFile(projectRoot);
  if (!merged) return {};
  return {
    templateRepo: typeof merged.templateRepo === "string" ? merged.templateRepo : undefined,
    templateSubdir: typeof merged.templateSubdir === "string" ? merged.templateSubdir : undefined,
    tui:
      merged.tui && typeof merged.tui === "object"
        ? (merged.tui as HillbillyConfig["tui"])
        : undefined,
  };
}

export async function writeProjectConfig(
  projectRoot: string,
  config: HillbillyConfig,
): Promise<void> {
  const merged = (await readMergedFile(projectRoot)) ?? {};
  merged.templateRepo = config.templateRepo;
  merged.templateSubdir = config.templateSubdir;
  if (config.tui) merged.tui = config.tui;
  await writeMergedFile(projectRoot, merged);
}

function resolveConfiguredTemplateRoot(config: HillbillyConfig, baseDir: string): string | null {
  if (!config.templateRepo) return null;

  const repoRoot = resolve(baseDir, config.templateRepo);
  const subdir = config.templateSubdir ?? "template";
  const templateRoot = resolve(repoRoot, subdir);

  return existsSync(templateRoot) ? templateRoot : repoRoot;
}

async function resolveCopierTemplateRoot(projectRoot: string): Promise<string | null> {
  const merged = await readMergedFile(projectRoot);
  if (!merged) return null;
  const srcPath = merged._src_path;
  if (typeof srcPath !== "string") return null;

  const sourceRoot = resolve(projectRoot, srcPath);
  const templateRoot = resolve(sourceRoot, "template");
  return existsSync(templateRoot) ? templateRoot : sourceRoot;
}

export async function resolveTemplateRoot(
  projectRoot: string,
  options: { template?: string } = {},
): Promise<TemplateResolution> {
  const normalizedProjectRoot = resolveProjectRoot(projectRoot);

  if (options.template) {
    const templateRoot = resolve(options.template);
    return { templateRoot, source: "cli" };
  }

  const projectConfig = await readProjectConfig(normalizedProjectRoot);
  const projectTemplateRoot = projectConfig
    ? resolveConfiguredTemplateRoot(projectConfig, normalizedProjectRoot)
    : null;
  if (projectTemplateRoot) {
    return {
      templateRoot: projectTemplateRoot,
      source: "project-config",
      configPath: projectConfigPath(normalizedProjectRoot),
    };
  }

  const copierTemplateRoot = await resolveCopierTemplateRoot(normalizedProjectRoot);
  if (copierTemplateRoot) {
    return { templateRoot: copierTemplateRoot, source: "copier" };
  }

  throw new Error(
    `No Hillbilly template source found for ${normalizedProjectRoot}. Run \`hillbilly config set-template /path/to/hillbilly\`, pass \`--template\`, or ensure hillbilly.yml has _src_path.`,
  );
}

export async function writeTemplateConfig(
  projectRoot: string,
  templateRepo: string,
  templateSubdir = "template",
): Promise<void> {
  const config: HillbillyConfig = {
    templateRepo: resolve(templateRepo),
    templateSubdir,
  };
  await writeProjectConfig(projectRoot, config);
}

// ---------------------------------------------------------------------------
// Copier answers — read from the merged file, with fallback to old .copier-answers.yml
// ---------------------------------------------------------------------------

export async function readCopierAnswers(projectRoot: string): Promise<Record<string, unknown>> {
  const merged = await readMergedFile(projectRoot);

  if (merged?.copier && typeof merged.copier === "object" && !Array.isArray(merged.copier)) {
    return merged.copier as Record<string, unknown>;
  }

  const legacyPath = resolve(projectRoot, ".copier-answers.yml");
  if (existsSync(legacyPath)) {
    const raw = await readFile(legacyPath, "utf-8");
    return (parseYaml(raw) as Record<string, unknown> | null) ?? {};
  }

  return {};
}

export async function readConfig(path: string): Promise<HillbillyConfig | null> {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf-8");
  const parsed = parseYaml(raw);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as HillbillyConfig)
    : {};
}

export async function writeConfig(path: string, config: HillbillyConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, stringifyYaml(config), "utf-8");
}

export async function mergeCopierAnswersIntoProject(
  projectRoot: string,
  answers: Record<string, unknown>,
): Promise<void> {
  const merged = (await readMergedFile(projectRoot)) ?? {};
  merged.copier = answers;
  await writeMergedFile(projectRoot, merged);
}
