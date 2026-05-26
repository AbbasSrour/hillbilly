import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const EXCLUDE_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "coverage",
  ".turbo",
  ".vite",
  "bin",
  "paraglide",
]);

const EXCLUDE_FILE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".woff",
  ".woff2",
  ".eot",
  ".ttf",
  ".otf",
  ".mp4",
  ".webm",
  ".ogg",
  ".mp3",
  ".wav",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".7z",
  ".rar",
]);

export function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const base = parts[parts.length - 1] ?? "";

  for (const part of parts) {
    if (EXCLUDE_DIRS.has(part)) return true;
  }

  if (parts.some((part, index) => part === "i18n" && parts[index + 1] === "generated")) {
    return true;
  }

  if (normalized === "packages/sdk/openapi.json" || normalized.startsWith("packages/sdk/src/")) {
    return true;
  }

  if (
    (normalized.startsWith("project.inlang/") || normalized.includes("/project.inlang/")) &&
    !normalized.endsWith("project.inlang/settings.json")
  ) {
    return true;
  }

  if (
    base.endsWith(".log") ||
    /^\.env(\.(local|development|production|staging|test))?$/.test(base) ||
    base === ".gitkeep" ||
    base === ".DS_Store" ||
    base === ".hillbilly-sync.yml" ||
    base === ".copier-answers.yml" ||
    base === ".copier-answers.yml.jinja"
  ) {
    return true;
  }

  for (const ext of EXCLUDE_FILE_EXTENSIONS) {
    if (base.endsWith(ext)) return true;
  }

  return false;
}

export async function walkFiles(
  root: string,
  options: { stripJinja?: boolean } = {},
): Promise<string[]> {
  const { stripJinja = false } = options;
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(root, fullPath).replaceAll("\\", "/");

      if (shouldExclude(relativePath)) continue;

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (stripJinja && relativePath.endsWith(".jinja")) {
          results.push(relativePath.slice(0, -".jinja".length));
        } else {
          results.push(relativePath);
        }
      }
    }
  }

  await walk(root);
  return results;
}
