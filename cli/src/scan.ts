import { readFile } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { existsSync } from "node:fs";
import fastGlob from "fast-glob";
import { parse as parseYaml } from "yaml";
import { createPatch } from "diff";

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
  status: "modified" | "added";
  /** Parsed hunks (for modified files) — each hunk is independently stageable */
  hunks?: DiffHunk[];
  /** Full unified diff */
  diff?: string;
  /** Full content of the project file (for added files) */
  projectContent?: string;
}

export interface ScanResult {
  /** Root of the hillbilly template directory */
  templateRoot: string;
  /** All syncable files found */
  files: SyncFile[];
}

// ---------------------------------------------------------------------------
// Marker
// ---------------------------------------------------------------------------

const MARKER = "/* @hillbilly-sync */";

async function hasMarker(filePath: string): Promise<boolean> {
  try {
    const file = Bun.file(filePath);
    const stream = file.stream();
    const reader = stream.getReader();
    const chunk = await reader.read();
    reader.releaseLock();
    if (!chunk.value) return false;
    const firstLine = new TextDecoder().decode(chunk.value).split("\n")[0] ?? "";
    return firstLine.trim() === MARKER;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Template root detection
// ---------------------------------------------------------------------------

async function findCopierAnswers(projectRoot: string): Promise<string | null> {
  const path = resolve(projectRoot, ".copier-answers.yml");
  if (!existsSync(path)) return null;
  return path;
}

async function resolveTemplateRoot(projectRoot: string): Promise<string | null> {
  const answersPath = await findCopierAnswers(projectRoot);
  if (!answersPath) return null;

  const raw = await readFile(answersPath, "utf-8");
  const parsed = parseYaml(raw) as Record<string, unknown>;
  const srcPath = parsed._src_path;
  if (typeof srcPath !== "string") return null;

  let templateRoot = resolve(dirname(answersPath), srcPath, "template");
  if (!existsSync(templateRoot)) {
    templateRoot = resolve(dirname(answersPath), srcPath);
  }
  return templateRoot;
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

export async function scan(projectRoot: string): Promise<ScanResult> {
  const templateRoot = await resolveTemplateRoot(projectRoot);
  if (!templateRoot) {
    throw new Error(
      `No .copier-answers.yml found in ${projectRoot}. Is this a Hillbilly-generated project?`,
    );
  }

  const allFiles = await fastGlob(["**/*", "!**/node_modules/**", "!**/dist/**", "!.git/**", "!**/.turbo/**"], {
    cwd: projectRoot,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  const files: SyncFile[] = [];

  for (const filePath of allFiles) {
    if (filePath.endsWith(".png") || filePath.endsWith(".jpg") || filePath.endsWith(".ico")) continue;

    const marked = await hasMarker(filePath);
    if (!marked) continue;

    const relativePath = relative(projectRoot, filePath);
    const templatePath = resolve(templateRoot, relativePath);

    if (existsSync(templatePath)) {
      const [projectContent, templateContent] = await Promise.all([
        readFile(filePath, "utf-8"),
        readFile(templatePath, "utf-8"),
      ]);

      if (projectContent === templateContent) continue;

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

  return { templateRoot, files };
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
    const oldRangeEnd = hunk.oldStart + hunk.oldLines;
    const hunkBody = hunkLines.slice(1); // skip @@ header

    for (const line of hunkBody) {
      if (line.startsWith("+") || line === "+") {
        newLines.push(line.slice(1)); // added line
      } else if (line.startsWith("-") || line === "-") {
        // removed line — skip it
      } else {
        // context line
        newLines.push(line.startsWith(" ") ? line.slice(1) : line);
      }
    }

    lines.splice(hunk.oldStart, hunk.oldLines, ...newLines);
  }

  return lines.join("\n");
}
