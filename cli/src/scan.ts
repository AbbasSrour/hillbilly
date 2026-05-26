/// <reference types="bun" />
import { readFile, readdir } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { existsSync } from "node:fs";
import { createPatch } from "diff";
import { parse as parseYaml } from "yaml";
import { resolveProjectRoot, resolveTemplateRoot } from "./config.js";
import { readSyncManifest, trackedSyncPaths } from "./manifest.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiffHunk {
  /** The raw unified diff text for this hunk */
  text: string;
  /** 0-indexed line numbers in the template (old) file this hunk applies to */
  oldStart: number;
  oldLines: number;
  /** 0-indexed line numbers in the project (new) file */
  newStart: number;
  newLines: number;
}

export interface SyncFile {
  /** Path relative to the project root */
  projectPath: string;
  /** Full path to the corresponding file in the hillbilly template */
  templatePath: string;
  /** Status of this file relative to the template */
  status: "modified" | "added" | "deleted";
  /** Parsed hunks (for modified files) — each hunk is independently stageable */
  hunks?: DiffHunk[];
  /** Full unified diff */
  diff?: string;
  /** Full content of the project file (for added files) */
  projectContent?: string;
}

export interface ScanResult {
  /** Root of the generated project */
  projectRoot: string;
  /** Root of the hillbilly template directory */
  templateRoot: string;
  /** All syncable files found */
  files: SyncFile[];
}

// ---------------------------------------------------------------------------
// Template walker
// ---------------------------------------------------------------------------

function shouldExclude(filePath: string): boolean {
  const normalized = filePath.replaceAll("\\", "/");
  const parts = normalized.split("/");

  // Directory name exclusions
  for (const part of parts) {
    if (
      part === "node_modules" ||
      part === "dist" ||
      part === ".git" ||
      part === "coverage" ||
      part === ".turbo" ||
      part === ".vite" ||
      part === "bin" ||
      part === "paraglide"
    ) {
      return true;
    }
  }

  // Generated i18n output can exist at any package/app depth.
  if (parts.some((part, index) => part === "i18n" && parts[index + 1] === "generated")) {
    return true;
  }

  // Inlang manages these files itself; settings.json is the source of truth we sync.
  if (
    (normalized.startsWith("project.inlang/") || normalized.includes("/project.inlang/")) &&
    !normalized.endsWith("project.inlang/settings.json")
  ) {
    return true;
  }

  // File pattern exclusions
  const base = parts[parts.length - 1] ?? "";
  if (
    base.endsWith(".log") ||
    /^\.env(\..*)?$/.test(base) ||
    base === ".gitkeep" ||
    base === ".DS_Store" ||
    base === ".hillbilly-sync.yml" ||
    base === ".copier-answers.yml" ||
    base === ".copier-answers.yml.jinja"
  ) {
    return true;
  }

  return false;
}

async function walkTemplate(templateRoot: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = relative(templateRoot, fullPath).replaceAll("\\", "/");

      if (shouldExclude(relativePath)) continue;

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        results.push(relativePath);
      }
    }
  }

  await walk(templateRoot);
  return results;
}

// ---------------------------------------------------------------------------
// Copier rendering
// ---------------------------------------------------------------------------

async function readCopierAnswers(projectRoot: string): Promise<Record<string, unknown>> {
  const answersPath = resolve(projectRoot, ".copier-answers.yml");
  if (!existsSync(answersPath)) return {};

  const raw = await readFile(answersPath, "utf-8");
  return (parseYaml(raw) as Record<string, unknown> | null) ?? {};
}

function renderSimpleCopierVariables(content: string, answers: Record<string, unknown>): string {
  return content.replace(/\[\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\]\]/g, (match, key: string) => {
    const value = answers[key];
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : match;
  });
}

function renderTemplateForComparison(
  templatePath: string,
  templateContent: string,
  answers: Record<string, unknown>,
): string {
  if (!templatePath.endsWith(".jinja")) return templateContent;
  return renderSimpleCopierVariables(templateContent, answers);
}

function toProjectPath(templateRelativePath: string): string {
  // Strip .jinja suffix — tsconfig.json.jinja → tsconfig.json
  return templateRelativePath.replace(/\.jinja$/, "");
}

function resolveTemplateFilePath(templateRoot: string, relativePath: string): string {
  const templatePath = resolve(templateRoot, relativePath);
  if (existsSync(templatePath)) return templatePath;

  const jinjaTemplatePath = `${templatePath}.jinja`;
  if (existsSync(jinjaTemplatePath)) return jinjaTemplatePath;

  return templatePath;
}

// ---------------------------------------------------------------------------
// Hunk parsing
// ---------------------------------------------------------------------------

function parseHunks(unifiedDiff: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  const lines = unifiedDiff.split("\n");
  let currentHunk: string[] = [];
  let inHunk = false;
  let oldStart = 0;
  let oldLines = 0;
  let newStart = 0;
  let newLines = 0;

  // Regex: @@ -oldStart,oldLines +newStart,newLines @@
  const hunkHeader = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;

  for (const line of lines) {
    const match = hunkHeader.exec(line);
    if (match) {
      // Push previous hunk
      if (inHunk) {
        hunks.push({
          text: currentHunk.join("\n"),
          oldStart: oldStart - 1, // convert to 0-indexed
          oldLines,
          newStart: newStart - 1,
          newLines,
        });
      }
      currentHunk = [line];
      inHunk = true;
      oldStart = Number.parseInt(match[1]!, 10);
      oldLines = match[2] ? Number.parseInt(match[2], 10) : 1;
      newStart = Number.parseInt(match[3]!, 10);
      newLines = match[4] ? Number.parseInt(match[4], 10) : 1;
    } else if (inHunk) {
      currentHunk.push(line);
    }
  }

  if (inHunk) {
    hunks.push({
      text: currentHunk.join("\n"),
      oldStart: oldStart - 1,
      oldLines,
      newStart: newStart - 1,
      newLines,
    });
  }

  return hunks;
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

export async function scan(
  projectRoot: string,
  options: { template?: string } = {},
): Promise<ScanResult> {
  const resolvedProjectRoot = resolveProjectRoot(projectRoot);
  const { templateRoot } = await resolveTemplateRoot(resolvedProjectRoot, options);
  const copierAnswers = await readCopierAnswers(resolvedProjectRoot);
  const manifest = await readSyncManifest(resolvedProjectRoot);

  const untrackedPaths = new Set(
    manifest.files.filter((f) => f.state === "untracked").map((f) => f.path),
  );

  const files: SyncFile[] = [];
  const seenPaths = new Set<string>();

  async function addSyncFile(relativePath: string): Promise<void> {
    if (seenPaths.has(relativePath)) return;
    seenPaths.add(relativePath);

    if (untrackedPaths.has(relativePath)) return;

    const filePath = resolve(resolvedProjectRoot, relativePath);
    const templatePath = resolveTemplateFilePath(templateRoot, relativePath);

    if (!existsSync(filePath)) {
      if (existsSync(templatePath)) {
        const rawTemplateContent = await readFile(templatePath, "utf-8");
        const templateContent = renderTemplateForComparison(
          templatePath,
          rawTemplateContent,
          copierAnswers,
        );
        const diff = createPatch(relativePath, templateContent, "");
        files.push({
          projectPath: relativePath,
          templatePath,
          status: "deleted",
          diff,
          hunks: parseHunks(diff),
        });
      }
      return;
    }

    if (existsSync(templatePath)) {
      const [projectContent, rawTemplateContent] = await Promise.all([
        readFile(filePath, "utf-8"),
        readFile(templatePath, "utf-8"),
      ]);
      const templateContent = renderTemplateForComparison(
        templatePath,
        rawTemplateContent,
        copierAnswers,
      );

      if (projectContent === templateContent) return;

      const diff = createPatch(relativePath, templateContent, projectContent);
      files.push({
        projectPath: relativePath,
        templatePath,
        status: "modified",
        diff,
        hunks: parseHunks(diff),
      });
    } else {
      const projectContent = await readFile(filePath, "utf-8");
      files.push({ projectPath: relativePath, templatePath, status: "added", projectContent });
    }
  }

  // 1. Walk the template directory and auto-discover all files
  const templateFiles = await walkTemplate(templateRoot);
  for (const templateRelativePath of templateFiles) {
    const projectPath = toProjectPath(templateRelativePath);
    await addSyncFile(projectPath);
  }

  // 2. Also check manifest-tracked files (project-added files not in template)
  for (const relativePath of trackedSyncPaths(manifest)) {
    if (!seenPaths.has(relativePath)) {
      await addSyncFile(relativePath);
    }
  }

  return { projectRoot: resolvedProjectRoot, templateRoot, files };
}

/**
 * Apply a set of staged hunks to a template file, returning the new content.
 * Only the hunks whose index is in `stagedHunkIndices` are applied.
 */
export function applyStagedHunks(
  templateContent: string,
  hunks: DiffHunk[],
  stagedHunkIndices: Set<number>,
): string {
  const lines = templateContent.split("\n");

  // Apply hunks in reverse order to avoid index shifting
  const sorted = [...stagedHunkIndices]
    .map((i) => hunks[i]!)
    .sort((a, b) => b.oldStart - a.oldStart);

  for (const hunk of sorted) {
    const hunkLines = hunk.text.split("\n");
    // Parse each hunk line to extract added/removed/context lines
    const newLines: string[] = [];
    const hunkBody = hunkLines.slice(1); // skip @@ header

    for (let idx = 0; idx < hunkBody.length; idx++) {
      const line = hunkBody[idx]!;
      if (line === "" && idx === hunkBody.length - 1) {
        continue;
      }

      if (line.startsWith("+") || line === "+") {
        newLines.push(line.slice(1)); // added line
      } else if (line.startsWith("-") || line === "-") {
        // removed line — skip it
      } else if (line.startsWith("\\")) {
        // Diff metadata, e.g. "\ No newline at end of file" — skip it.
      } else {
        // context line
        newLines.push(line.startsWith(" ") ? line.slice(1) : line);
      }
    }

    lines.splice(hunk.oldStart, hunk.oldLines, ...newLines);
  }

  return lines.join("\n");
}
