#!/usr/bin/env bun
import { $ } from "bun";
import path from "path";
import fs from "fs";

const dir = path.resolve(import.meta.dir, "..");
process.chdir(dir);

const parserWorker = fs.realpathSync(
  path.resolve(dir, "node_modules/@opentui/core/parser.worker.js"),
);
if (!fs.existsSync(parserWorker)) {
  console.error("parser.worker.js not found at", parserWorker);
  process.exit(1);
}

// Relative path from project root to parser.worker.js — used for $bunfs embedding
const workerRelativePath = path.relative(dir, parserWorker).replaceAll("\\", "/");

console.log("Building hillbilly...");
console.log("  entrypoints: src/index.ts,", workerRelativePath);

await Bun.build({
  entrypoints: ["./src/index.ts", parserWorker],
  compile: {
    outfile: "./dist/hillbilly",
  },
  define: {
    OTUI_TREE_SITTER_WORKER_PATH: `"/$bunfs/root/${workerRelativePath}"`,
  },
});

// Copy binary to template/bin/
await $`mkdir -p template/bin`;
await $`rm -f template/bin/hillbilly`;
await $`cp dist/hillbilly template/bin/hillbilly`;

console.log("✓ Built dist/hillbilly → template/bin/hillbilly");
