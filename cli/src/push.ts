import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import type { SyncFile } from "./scan.js";
import { applyStagedHunks } from "./scan.js";

export interface PushResult {
  written: string[];
  deleted: string[];
  failed: { path: string; error: string }[];
}

/**
 * Push staged changes back to the hillbilly template.
 *
 * @param files - the scan result files
 * @param staged - Map<projectPath, Set<hunkIndex>> — which hunks to push per file.
 *                 If a file is staged with an empty set, push ALL changes for that file.
 * @param templateRoot - root of the template directory
 */
export async function pushChanges(
  files: SyncFile[],
  staged: Map<string, Set<number>>,
  _templateRoot: string,
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
      } else if (file.status === "added") {
        if (file.projectContent === undefined) {
          throw new Error("projectContent is missing for added file");
        }
        await writeFile(file.templatePath, file.projectContent, "utf-8");
        result.written.push(file.templatePath);
      } else if (file.status === "modified") {
        let newContent: string;

        if (file.hunks && file.hunks.length > 0) {
          // Determine which hunk indices to apply
          const indicesToApply: Set<number> =
            stagedIndices.size === 0 ? new Set(file.hunks.map((_, i) => i)) : stagedIndices;

          // Read current template content
          const templateContent = await readFile(file.templatePath, "utf-8");

          // Apply selected hunks
          newContent = applyStagedHunks(templateContent, file.hunks, indicesToApply);
        } else {
          // No hunks available — write project content directly
          if (file.projectContent === undefined) {
            throw new Error("projectContent is missing for modified file with no hunks");
          }
          newContent = file.projectContent;
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
