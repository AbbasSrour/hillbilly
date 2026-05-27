/// <reference types="bun" />
import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { createPatch } from "diff";
import { parse as parseYaml } from "yaml";
import { resolveProjectRoot, resolveTemplateRoot } from "./config.js";
import { readSyncManifest, trackedSyncPaths } from "./manifest.js";
import { shouldExclude, walkFiles } from "./exclude.js";

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
  /** True if the new side of this hunk ends WITHOUT a trailing newline */
  newNoNewline?: boolean;
}

export interface SyncFile {
  projectPath: string;
  templatePath: string;
  status: "modified" | "added" | "deleted" | "stale" | "moved" | "renamed";
  movedFrom?: string;
  movedFromTemplatePath?: string;
  hunks?: DiffHunk[];
  formatOnly?: boolean;
  projectContent?: string;
  templateContent?: string;
  addedLines?: number;
  removedLines?: number;
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
// Copier rendering
// ---------------------------------------------------------------------------

export async function readCopierAnswers(projectRoot: string): Promise<Record<string, unknown>> {
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

const RAW_BLOCK_RE = /\[%-?\s*raw\s*-?%\]([\s\S]*?)\[%-?\s*endraw\s*-?%\]/g;

function stripRawBlocks(content: string): string {
  return content.replace(RAW_BLOCK_RE, "$1");
}

function renderTemplateForComparison(
  templatePath: string,
  templateContent: string,
  answers: Record<string, unknown>,
): string {
  if (!templatePath.endsWith(".jinja")) return templateContent;
  return stripRawBlocks(renderSimpleCopierVariables(templateContent, answers));
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

function pathChangeStatus(oldPath: string, newPath: string): "moved" | "renamed" {
  if (dirname(oldPath) === dirname(newPath) && basename(oldPath) !== basename(newPath)) {
    return "renamed";
  }

  return "moved";
}

function normalizeFormatStyle(content: string): string {
  return content
    .replaceAll("\r\n", "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/['"]/g, '"')
    .replace(/;/g, "")
    .replace(/\s+/g, "");
}

function isFormattingOnlyDifference(templateContent: string, projectContent: string): boolean {
  if (templateContent === projectContent) return false;
  return normalizeFormatStyle(templateContent) === normalizeFormatStyle(projectContent);
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
  let newNoNewline = false;

  // Regex: @@ -oldStart,oldLines +newStart,newLines @@
  const hunkHeader = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/;

  function pushHunk() {
    if (!inHunk) return;
    hunks.push({
      text: currentHunk.join("\n"),
      oldStart: Math.max(0, oldStart - 1), // convert to 0-indexed
      oldLines,
      newStart: Math.max(0, newStart - 1),
      newLines,
      newNoNewline,
    });
  }

  for (const line of lines) {
    const match = hunkHeader.exec(line);
    if (match) {
      // Push previous hunk
      pushHunk();
      currentHunk = [line];
      inHunk = true;
      newNoNewline = false;
      oldStart = Number.parseInt(match[1]!, 10);
      oldLines = match[2] ? Number.parseInt(match[2], 10) : 1;
      newStart = Number.parseInt(match[3]!, 10);
      newLines = match[4] ? Number.parseInt(match[4], 10) : 1;
    } else if (inHunk) {
      currentHunk.push(line);
      if (line.startsWith("\\") && line.includes("No newline")) {
        // Check if the no-newline marker follows a '+' line by scanning backwards
        const body = currentHunk;
        for (let i = body.length - 2; i >= 0; i--) {
          if (body[i]!.startsWith("+")) {
            newNoNewline = true;
            break;
          }
          if (body[i]!.startsWith("-")) {
            // follows old-side — not newNoNewline
            break;
          }
        }
      }
    }
  }

  pushHunk();

  return hunks;
}

// ---------------------------------------------------------------------------
// Main scanner
// ---------------------------------------------------------------------------

async function tryReadText(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}

function diffStat(file: SyncFile): { added: number; removed: number } {
  if (!file.hunks) return { added: 0, removed: 0 };
  let added = 0;
  let removed = 0;
  for (const hunk of file.hunks) {
    for (const line of hunk.text.split("\n").slice(1)) {
      if (line.startsWith("+")) added++;
      else if (line.startsWith("-")) removed++;
    }
  }
  return { added, removed };
}

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
  const deletedFiles = new Map<string, { file: SyncFile; templateContent: string }>();

  async function addSyncFile(
    relativePath: string,
    options: { manifestTracked?: boolean } = {},
  ): Promise<void> {
    if (seenPaths.has(relativePath)) return;
    seenPaths.add(relativePath);

    if (untrackedPaths.has(relativePath)) return;

    const filePath = resolve(resolvedProjectRoot, relativePath);
    const templatePath = resolveTemplateFilePath(templateRoot, relativePath);

    if (!existsSync(filePath)) {
      if (existsSync(templatePath)) {
        const rawTemplateContent = await tryReadText(templatePath);
        if (rawTemplateContent === null) return;
        const templateContent = renderTemplateForComparison(
          templatePath,
          rawTemplateContent,
          copierAnswers,
        );
        const unifiedDiff = createPatch(relativePath, templateContent, "");
        const hunks = parseHunks(unifiedDiff);
        const stats = { added: 0, removed: 0 };
        for (const hunk of hunks) {
          for (const line of hunk.text.split("\n").slice(1)) {
            if (line.startsWith("+")) stats.added++;
            else if (line.startsWith("-")) stats.removed++;
          }
        }
        files.push({
          projectPath: relativePath,
          templatePath,
          status: "deleted",
          hunks,
          addedLines: stats.added,
          removedLines: stats.removed,
          templateContent,
        });
        deletedFiles.set(relativePath, { file: files[files.length - 1]!, templateContent });
      }
      return;
    }

    if (existsSync(templatePath)) {
      const [projectContent, rawTemplateContent] = await Promise.all([
        tryReadText(filePath),
        tryReadText(templatePath),
      ]);
      if (projectContent === null || rawTemplateContent === null) return;

      const templateContent = renderTemplateForComparison(
        templatePath,
        rawTemplateContent,
        copierAnswers,
      );

      if (projectContent === templateContent) return;

      const unifiedDiff = createPatch(relativePath, templateContent, projectContent);
      const hunks = parseHunks(unifiedDiff);
      const stats = { added: 0, removed: 0 };
      for (const hunk of hunks) {
        for (const line of hunk.text.split("\n").slice(1)) {
          if (line.startsWith("+")) stats.added++;
          else if (line.startsWith("-")) stats.removed++;
        }
      }
      files.push({
        projectPath: relativePath,
        templatePath,
        status: "modified",
        formatOnly: isFormattingOnlyDifference(templateContent, projectContent),
        hunks,
        addedLines: stats.added,
        removedLines: stats.removed,
        templateContent,
        projectContent,
      });
    } else {
      const projectContent = await tryReadText(filePath);
      if (projectContent === null) return;
      const lineCount = projectContent.split("\n").length;
      files.push({
        projectPath: relativePath,
        templatePath,
        status: "added",
        projectContent,
        addedLines: lineCount,
        removedLines: 0,
      });
    }
  }

  // 1. Walk the template directory and auto-discover all files
  const templateFiles = await walkFiles(templateRoot);
  for (const templateRelativePath of templateFiles) {
    const projectPath = toProjectPath(templateRelativePath);
    await addSyncFile(projectPath);
  }

  // 2. Also check manifest-tracked files (project-added files not in template)
  for (const relativePath of trackedSyncPaths(manifest)) {
    if (!seenPaths.has(relativePath)) {
      await addSyncFile(relativePath, { manifestTracked: true });
    }
  }

  // 3. Detect project-side moves before requiring manual mark. Exact content
  // matches are intentionally conservative to avoid guessing unrelated adds.
  if (deletedFiles.size > 0) {
    const projectFiles = await walkFiles(resolvedProjectRoot);
    for (const relativePath of projectFiles) {
      if (seenPaths.has(relativePath) || untrackedPaths.has(relativePath)) continue;

      const projectContent = await tryReadText(resolve(resolvedProjectRoot, relativePath));
      if (projectContent === null) continue;

      const match = [...deletedFiles.entries()].find(
        ([, deleted]) => deleted.templateContent === projectContent,
      );
      if (!match) continue;

      const [oldPath, deleted] = match;
      const deletedIndex = files.indexOf(deleted.file);
      if (deletedIndex !== -1) files.splice(deletedIndex, 1);
      deletedFiles.delete(oldPath);
      seenPaths.add(relativePath);

      files.push({
        projectPath: relativePath,
        templatePath: resolveTemplateFilePath(templateRoot, relativePath),
        status: pathChangeStatus(oldPath, relativePath),
        movedFrom: oldPath,
        movedFromTemplatePath: deleted.file.templatePath,
        projectContent,
      });
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
  const stripped = stripRawBlocks(templateContent);
  const lines = stripped === "" ? [] : stripped.split("\n");
  const templateEndsWithNewline = stripped.endsWith("\n");
  let resultEndsWithNewline = templateEndsWithNewline;

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

    // After splice, the new content occupies positions oldStart to oldStart + newLines.length.
    // If that reaches the end, this hunk determines trailing newline state.
    if (hunk.newNoNewline) {
      resultEndsWithNewline = false;
    } else if (hunk.oldStart + newLines.length >= lines.length) {
      resultEndsWithNewline = true;
    }
  }

  let result = lines.join("\n");
  if (resultEndsWithNewline && !result.endsWith("\n")) {
    result += "\n";
  }
  if (!resultEndsWithNewline && result.endsWith("\n")) {
    result = result.slice(0, -1);
  }
  return result;
}
