import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export const SYNC_MANIFEST_NAME = ".hillbilly-sync.yml";

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
  return resolve(projectRoot, SYNC_MANIFEST_NAME);
}

export async function readSyncManifest(projectRoot: string): Promise<SyncManifest> {
  const path = syncManifestPath(projectRoot);
  if (!existsSync(path)) return { version: 1, files: [] };

  const raw = await readFile(path, "utf-8");
  const parsed = parseYaml(raw) as Partial<SyncManifest> | null;

  return {
    version: 1,
    files: Array.isArray(parsed?.files)
      ? parsed.files.filter((file): file is SyncManifestFile => {
          return (
            typeof file === "object" &&
            file !== null &&
            typeof file.path === "string" &&
            (file.state === "tracked" || file.state === "untracked")
          );
        })
      : [],
  };
}

export async function writeSyncManifest(
  projectRoot: string,
  manifest: SyncManifest,
): Promise<void> {
  const path = syncManifestPath(projectRoot);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, stringifyYaml({ version: 1, files: manifest.files }), "utf-8");
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
