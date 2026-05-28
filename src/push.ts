import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import type { SyncFile } from "./scan.js";
import { applyStagedHunks } from "./scan.js";

export interface PushResult {
  written: string[];
  deleted: string[];
  failed: { path: string; error: string }[];
}

function reverseRender(content: string, projectName: string): string {
  if (!projectName) return content;
  return content
    .replaceAll(`@${projectName}/`, `@[[ project_name ]]/`)
    .replaceAll(projectName, "[[ project_name ]]");
}

/**
 * Apply reverse-rendering and auto raw-block wrapping for .jinja files.
 */
function prepareTemplateContent(
  content: string,
  templatePath: string,
  projectName: string,
): string {
  let result = reverseRender(content, projectName);
  if (templatePath.endsWith(".jinja")) {
    result = wrapJinjaRawBlocks(result);
  }
  return result;
}

/**
 * Wraps bare {{ ... }} and ${{ ... }} expressions in .jinja files with {% raw %} blocks
 * so Copier's Jinja2 engine doesn't try to parse them as template variables.
 *
 * Handles nested braces (e.g. value={{ foo: { bar: 1 } }}) and skips
 * expressions that already appear inside {% raw %} ... {% endraw %} blocks.
 */
export function wrapJinjaRawBlocks(content: string): string {
  const RAW_START = "[% raw %]";
  const RAW_END = "[% endraw %]";

  const lines = content.split("\n");
  const result: string[] = [];
  let inRawBlock = false;

  for (const line of lines) {
    // Track raw block state
    if (line.includes(RAW_START)) inRawBlock = true;
    if (line.includes(RAW_END)) {
      inRawBlock = false;
      result.push(line);
      continue;
    }

    if (inRawBlock) {
      result.push(line);
      continue;
    }

    // Find bare {{ or ${{ on this line
    let processed = line;
    let idx = 0;
    let output = "";

    while (idx < processed.length) {
      // Look for ${{ or {{ (prefer ${{ if both match at same position)
      const openIdx = processed.indexOf("{{", idx);
      if (openIdx === -1) {
        output += processed.slice(idx);
        break;
      }

      // Check if this {{ is already inside a raw tag
      const beforeOpen = processed.slice(0, openIdx);
      if (beforeOpen.includes(RAW_START) && !beforeOpen.includes(RAW_END)) {
        output += processed.slice(idx);
        break;
      }

      // Determine if this is ${{ or {{
      const isDollarBrace = openIdx > 0 && processed[openIdx - 1] === "$";
      const exprStart = isDollarBrace ? openIdx - 1 : openIdx;

      // Emit everything up to the expression start
      output += processed.slice(idx, exprStart);

      // Find the matching }} by tracking brace depth
      let depth = 1;
      let closeIdx = openIdx + 2;
      while (closeIdx < processed.length && depth > 0) {
        if (processed[closeIdx] === "{") {
          depth++;
        } else if (processed[closeIdx] === "}") {
          depth--;
        }
        closeIdx++;
      }

      if (depth === 0) {
        // Found matching }} — wrap in raw block
        const expr = processed.slice(exprStart, closeIdx);
        output += `${RAW_START}${expr}${RAW_END}`;
        idx = closeIdx;
      } else {
        // No closing }} on this line — emit as-is
        output += processed.slice(exprStart, openIdx + 2);
        idx = openIdx + 2;
      }
    }

    result.push(output);
  }

  return result.join("\n");
}

/**
 * Push staged changes back to the hillbilly template.
 *
 * @param files - the scan result files
 * @param staged - Map<projectPath, Set<hunkIndex>> — which hunks to push per file.
 *                 If a file is staged with an empty set, push ALL changes for that file.
 * @param templateRoot - root of the template directory
 * @param projectName - Copier project_name, used to reverse-render [[ project_name ]] when writing to template
 */
export async function pushChanges(
  files: SyncFile[],
  staged: Map<string, Set<number>>,
  _templateRoot: string,
  projectName?: string,
): Promise<PushResult> {
  const result: PushResult = {
    written: [],
    deleted: [],
    failed: [],
  };

  for (const file of files) {
    const stagedIndices = staged.get(file.projectPath);

    // Skip if not staged at all
    if (stagedIndices === undefined) {
      continue;
    }

    try {
      // Create parent directories if they don't exist
      await mkdir(dirname(file.templatePath), { recursive: true });

      if (file.status === "deleted") {
        await unlink(file.templatePath);
        result.deleted.push(file.templatePath);
      } else if (file.status === "moved" || file.status === "renamed") {
        if (file.projectContent === undefined) {
          throw new Error("projectContent is missing for moved/renamed file");
        }
        await writeFile(
          file.templatePath,
          prepareTemplateContent(file.projectContent, file.templatePath, projectName ?? ""),
          "utf-8",
        );
        result.written.push(file.templatePath);
        if (file.movedFromTemplatePath) {
          await unlink(file.movedFromTemplatePath);
          result.deleted.push(file.movedFromTemplatePath);
        }
      } else if (file.status === "added") {
        if (file.projectContent === undefined) {
          throw new Error("projectContent is missing for added file");
        }
        await writeFile(
          file.templatePath,
          prepareTemplateContent(file.projectContent, file.templatePath, projectName ?? ""),
          "utf-8",
        );
        result.written.push(file.templatePath);
      } else if (file.status === "modified") {
        let newContent: string;

        if (file.hunks && file.hunks.length > 0) {
          const indicesToApply: Set<number> =
            stagedIndices.size === 0 ? new Set(file.hunks.map((_, i) => i)) : stagedIndices;

          const templateContent = await readFile(file.templatePath, "utf-8");

          newContent = applyStagedHunks(templateContent, file.hunks, indicesToApply);
          newContent = prepareTemplateContent(newContent, file.templatePath, projectName ?? "");
        } else {
          if (file.projectContent === undefined) {
            throw new Error("projectContent is missing for modified file with no hunks");
          }
          newContent = prepareTemplateContent(
            file.projectContent,
            file.templatePath,
            projectName ?? "",
          );
        }

        await writeFile(file.templatePath, newContent, "utf-8");
        result.written.push(file.templatePath);
      } else if (file.status === "stale") {
        // Stale files are pruned from the project, not pushed to the template.
        continue;
      }
    } catch (error) {
      result.failed.push({
        path: file.templatePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}
