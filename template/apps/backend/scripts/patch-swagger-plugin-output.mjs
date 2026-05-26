import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The @nestjs/swagger/plugin emits metadata files containing bare `require()`
// (swagger 11) or `(await import(...))` (swagger 12) calls in metadata factory
// methods. In ESM projects (type: "module"), neither works out of the box:
// - Bare `require()` is unavailable in ESM
// - `await import()` appears inside non-async functions (SyntaxError)
//
// This script replaces both patterns with `require()` and adds a
// createRequire shim at the file top, making the module ESM-compatible.
// Remove this when swagger plugin's esmCompatible mode works reliably.

const DIST = join(process.cwd(), 'dist');

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      patch(full);
    }
  }
}

function patch(filePath) {
  let content = readFileSync(filePath, 'utf8');

  const hasBareRequire = /\brequire\(/.test(content);
  const hasAwaitImport = /\(await import\(/.test(content);

  if (!hasBareRequire && !hasAwaitImport) return;
  if (content.includes('createRequire')) return;

  // Swagger 12 generates (await import("...")) in non-async context.
  // Replace the whole expression with require("...") to avoid SyntaxError.
  if (hasAwaitImport) {
    content = content.replace(/\(await import\("([^"]+)"\)\)/g, 'require("$1")');
  }

  const shim = `import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
`;

  writeFileSync(filePath, shim + content);
  console.log(`Patched: ${filePath}`);
}

walk(DIST);
