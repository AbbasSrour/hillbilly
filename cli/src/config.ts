import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { homedir } from "node:os";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export interface HillbillyConfig {
  templateRepo?: string;
  templateSubdir?: string;
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

async function readConfig(path: string): Promise<HillbillyConfig | null> {
  if (!existsSync(path)) return null;
  const raw = await readFile(path, "utf-8");
  const parsed = parseYaml(raw) as HillbillyConfig | null;
  return parsed ?? {};
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
  const normalizedProjectRoot = resolve(projectRoot);

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
    return { templateRoot: globalTemplateRoot, source: "global-config", configPath: GLOBAL_CONFIG_PATH };
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
  await mkdir(dirname(configPath), { recursive: true });
  const config: HillbillyConfig = {
    templateRepo: resolve(templateRepo),
    templateSubdir,
  };
  await writeFile(configPath, stringifyYaml(config), "utf-8");
}
