import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
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
  };
}

export interface TemplateResolution {
  templateRoot: string;
  source: "cli" | "project-config" | "global-config" | "copier";
  configPath?: string;
}

export const PROJECT_CONFIG_NAME = ".hillbilly.yml";
export const GLOBAL_CONFIG_PATH = resolve(homedir(), ".config", "hillbilly", "config.yml");

export function projectConfigPath(projectRoot: string): string {
  return resolve(projectRoot, PROJECT_CONFIG_NAME);
}

export function resolveProjectRoot(startPath: string): string {
  let current = resolve(startPath);

  while (true) {
    if (
      existsSync(resolve(current, PROJECT_CONFIG_NAME)) ||
      existsSync(resolve(current, ".copier-answers.yml"))
    ) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) return resolve(startPath);
    current = parent;
  }
}

export async function readConfig(path: string): Promise<HillbillyConfig | null> {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf-8");
  const parsed = parseYaml(raw) as HillbillyConfig | null;
  return parsed ?? {};
}

export async function writeConfig(path: string, config: HillbillyConfig): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, stringifyYaml(config), "utf-8");
}

function resolveConfiguredTemplateRoot(config: HillbillyConfig, baseDir: string): string | null {
  if (!config.templateRepo) return null;

  const repoRoot = resolve(baseDir, config.templateRepo);
  const subdir = config.templateSubdir ?? "template";
  const templateRoot = resolve(repoRoot, subdir);

  return existsSync(templateRoot) ? templateRoot : repoRoot;
}

async function resolveCopierTemplateRoot(projectRoot: string): Promise<string | null> {
  const answersPath = resolve(projectRoot, ".copier-answers.yml");
  if (!existsSync(answersPath)) return null;

  const raw = await readFile(answersPath, "utf-8");
  const parsed = parseYaml(raw) as Record<string, unknown>;
  const srcPath = parsed._src_path;
  if (typeof srcPath !== "string") return null;

  const sourceRoot = resolve(dirname(answersPath), srcPath);
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

  const projectPath = projectConfigPath(normalizedProjectRoot);
  const projectConfig = await readConfig(projectPath);
  const projectTemplateRoot = projectConfig
    ? resolveConfiguredTemplateRoot(projectConfig, normalizedProjectRoot)
    : null;
  if (projectTemplateRoot) {
    return { templateRoot: projectTemplateRoot, source: "project-config", configPath: projectPath };
  }

  const globalConfig = await readConfig(GLOBAL_CONFIG_PATH);
  const globalTemplateRoot = globalConfig
    ? resolveConfiguredTemplateRoot(globalConfig, dirname(GLOBAL_CONFIG_PATH))
    : null;
  if (globalTemplateRoot) {
    return {
      templateRoot: globalTemplateRoot,
      source: "global-config",
      configPath: GLOBAL_CONFIG_PATH,
    };
  }

  const copierTemplateRoot = await resolveCopierTemplateRoot(normalizedProjectRoot);
  if (copierTemplateRoot) {
    return { templateRoot: copierTemplateRoot, source: "copier" };
  }

  throw new Error(
    `No Hillbilly template source found for ${normalizedProjectRoot}. Run \`hillbilly config set-template /path/to/hillbilly\`, pass \`--template\`, or ensure .copier-answers.yml has _src_path.`,
  );
}

export async function writeTemplateConfig(
  configPath: string,
  templateRepo: string,
  templateSubdir = "template",
): Promise<void> {
  const existing = (await readConfig(configPath)) ?? {};
  const config: HillbillyConfig = {
    ...existing,
    templateRepo: resolve(templateRepo),
    templateSubdir,
  };
  await writeConfig(configPath, config);
}
