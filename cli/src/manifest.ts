import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { projectConfigPath } from "./config.js";

export const SYNC_MANIFEST_NAME = "hillbilly.yml";

export type SyncFileState = "tracked" | "untracked";

export interface SyncManifestFile {
  path: string;
  state: SyncFileState;
}

export interface SyncManifest {
  version: 1;
  files: SyncManifestFile[];
}

export function syncManifestPath(projectRoot: string): string {
  return projectConfigPath(projectRoot);
}

// ---------------------------------------------------------------------------
// Merged file helpers
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
// Sync manifest — stored in the `sync` key of hillbilly.yml
// ---------------------------------------------------------------------------

export async function readSyncManifest(projectRoot: string): Promise<SyncManifest> {
  const merged = await readMergedFile(projectRoot);
  const rawSync = merged?.sync;
  if (!rawSync || typeof rawSync !== "object" || Array.isArray(rawSync)) {
    return { version: 1, files: [] };
  }
  const sync = rawSync as Record<string, unknown>;
  const files = Array.isArray(sync.files)
    ? (sync.files as unknown[]).filter(
        (file): file is SyncManifestFile =>
          typeof file === "object" &&
          file !== null &&
          typeof (file as Record<string, unknown>).path === "string" &&
          ((file as Record<string, unknown>).state === "tracked" ||
            (file as Record<string, unknown>).state === "untracked"),
      )
    : [];
  return { version: 1, files };
}

export async function writeSyncManifest(
  projectRoot: string,
  manifest: SyncManifest,
): Promise<void> {
  const merged = (await readMergedFile(projectRoot)) ?? {};
  merged.sync = { version: 1, files: manifest.files };
  await writeMergedFile(projectRoot, merged);
}

export function normalizeProjectPath(projectRoot: string, path: string): string {
  return relative(resolve(projectRoot), resolve(projectRoot, path)).replaceAll("\\", "/");
}

export function trackedSyncPaths(manifest: SyncManifest): string[] {
  return manifest.files.filter((file) => file.state === "tracked").map((file) => file.path);
}

export async function setSyncFileState(
  projectRoot: string,
  paths: string[],
  state: SyncFileState,
): Promise<SyncManifest> {
  const manifest = await readSyncManifest(projectRoot);
  const byPath = new Map(manifest.files.map((file) => [file.path, file]));

  for (const path of paths) {
    const normalizedPath = normalizeProjectPath(projectRoot, path);
    byPath.set(normalizedPath, { path: normalizedPath, state });
  }

  const next: SyncManifest = { version: 1, files: [...byPath.values()] };
  await writeSyncManifest(projectRoot, next);
  return next;
}

export async function removeSyncFiles(projectRoot: string, paths: string[]): Promise<SyncManifest> {
  const manifest = await readSyncManifest(projectRoot);
  const normalizedPaths = new Set(paths.map((path) => normalizeProjectPath(projectRoot, path)));
  const next: SyncManifest = {
    version: 1,
    files: manifest.files.filter((file) => !normalizedPaths.has(file.path)),
  };
  await writeSyncManifest(projectRoot, next);
  return next;
}
