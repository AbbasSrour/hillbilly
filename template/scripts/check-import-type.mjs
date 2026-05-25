#!/usr/bin/env node
/**
 * Checks that `import type` is not used for NestJS-injectable classes
 * (services, guards, interceptors, pipes, repositories, providers).
 *
 * Usage: node scripts/check-import-type.mjs [FILE...]
 */

import { readFileSync, existsSync } from 'node:fs';
import { relative } from 'node:path';

const INJECTABLE_PATTERNS = [
  /\/(service|guard|interceptor|pipe|repository|provider|subscriber)\/[^/]+/i,
  /\/module\/[^/]+\/(?!dto\/|entity\/|type\/|interface\/|enum\/|constant\/)[^/]+/i,
];

function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^import\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
      if (!match) continue;

      const [, symbols, fromPath] = match;

      // Only check relative or alias imports within the project
      if (!fromPath.startsWith('.') && !fromPath.startsWith('@/')) continue;

      if (INJECTABLE_PATTERNS.some((p) => p.test(fromPath))) {
        violations.push({ line: i + 1, symbols: symbols.trim(), from: fromPath });
      }
    }

    return violations;
  } catch {
    return [];
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/check-import-type.mjs [FILE...]');
  process.exit(0);
}

const allViolations = [];

for (const file of args) {
  if (!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
  if (!existsSync(file)) continue;
  const relPath = relative(process.cwd(), file);
  const violations = checkFile(file);

  for (const v of violations) {
    allViolations.push(`${relPath}:${v.line} — \`import type { ${v.symbols} }\` from "${v.from}"`);
  }
}

if (allViolations.length > 0) {
  console.error('\n❌ NestJS-injectable classes should use `import`, not `import type`:\n');
  console.error(allViolations.join('\n'));
  console.error('\n  These imports are erased at compile time, breaking DI metadata.\n');
  console.error('  Replace with: import { ... } from "..."\n');
  process.exit(1);
}

console.log('✅ No problematic `import type` usages for injectable classes.');
