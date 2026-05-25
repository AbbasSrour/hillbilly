const fs = require("node:fs");
const path = require("node:path");

// Nest CLI 12 alpha: `nest start` fails in ESM projects because
// tsc emits imports without .js extensions (tsc-alias fixes this)
// and the Swagger plugin emits bare require() calls (our shim fixes this).
// This patch makes `nest start` run postbuild steps after each compilation.

const root = process.cwd();
const backendPackageJson = path.join(root, "apps", "backend", "package.json");

if (!fs.existsSync(backendPackageJson)) {
  process.exit(0);
}

let startActionPath = path.join(
  root,
  "node_modules",
  "@nestjs",
  "cli",
  "actions",
  "start.action.js",
);

// Check Bun's isolated linker cache
if (!fs.existsSync(startActionPath)) {
  const bunNm = path.join(root, "node_modules", ".bun");
  if (fs.existsSync(bunNm)) {
    const entries = fs.readdirSync(bunNm, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.startsWith("@nestjs+cli")) continue;
      const full = path.join(
        bunNm,
        entry.name,
        "node_modules",
        "@nestjs",
        "cli",
        "actions",
        "start.action.js",
      );
      if (fs.existsSync(full)) {
        startActionPath = full;
        break;
      }
    }
  }
}

if (!fs.existsSync(startActionPath)) {
  process.exit(0);
}

startActionPath = fs.realpathSync(startActionPath);
let source = fs.readFileSync(startActionPath, "utf8");

// Patch 1: Add execSync import
const oldImport =
  "import { spawn } from 'child_process';";
const newImport =
  "import { execSync, spawn } from 'child_process';";

if (source.includes(oldImport)) {
  source = source.replace(oldImport, newImport);
} else if (!source.includes("execSync")) {
  // Already patched with execSync, or import line differs — try alternate
  const altPattern = /import\s*\{\s*spawn\s*\}\s*from\s*'child_process';/;
  if (altPattern.test(source)) {
    source = source.replace(
      altPattern,
      "import { execSync, spawn } from 'child_process';",
    );
  }
}

// Patch 2: Add postbuild steps in createOnSuccessHook
// Find: "return () => {" (first one inside createOnSuccessHook)
const returnFnMarker = "        return () => {";
const postbuildBlock = `        return () => {
            // ESM postbuild: tsc-alias adds .js extensions and resolves path aliases
            try {
                execSync('node_modules/.bin/tsc-alias -p tsconfig.build.json --resolve-full-paths --resolve-full-extension .js', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                });
            }
            catch (_) {
                // tsc-alias not available — skip
            }
            // Patch Swagger plugin ESM output: wraps require() calls
            try {
                execSync('node scripts/patch-swagger-plugin-output.mjs', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                });
            }
            catch (_) {
                // patch script not available — skip
            }`;

const ifChildProcessRef = "            if (childProcessRef) {";

// Only patch if not already done
if (source.includes(returnFnMarker) && !source.includes("ESM postbuild")) {
  source = source.replace(returnFnMarker, postbuildBlock);
}

fs.writeFileSync(startActionPath, source);
console.log("Patched @nestjs/cli start action for ESM postbuild support.");
