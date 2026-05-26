import { mkdir, readdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

const assetPattern =
  /^(parser\.worker\.js|tree-sitter-.*\.wasm|highlights-.*\.scm|injections-.*\.scm)$/;

async function copyMatchingFiles(fromDir: string, toDir: string): Promise<void> {
  await mkdir(toDir, { recursive: true });
  for (const entry of await readdir(fromDir)) {
    if (!assetPattern.test(entry)) continue;
    await copyFile(join(fromDir, entry), join(toDir, entry));
  }
}

await copyMatchingFiles("dist-worker", "dist");
await copyMatchingFiles("dist", "../template/bin");
