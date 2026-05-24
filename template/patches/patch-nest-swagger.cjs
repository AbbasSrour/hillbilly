const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

// TODO: Remove this postinstall patch when @nestjs/swagger publishes v12 with
// official Nest 12 support.

const root = process.cwd();
const backendPackageJson = path.join(root, "apps", "backend", "package.json");

if (!fs.existsSync(backendPackageJson)) {
  process.exit(0);
}

// Walk up from the backend to find the swagger package in workspace node_modules.
// Using require.resolve is blocked by the exports field, so we glob for it instead.
const possiblePaths = [
  path.join(root, "node_modules", "@nestjs", "swagger", "dist", "swagger-explorer.js"),
  path.join(root, "apps", "backend", "node_modules", "@nestjs", "swagger", "dist", "swagger-explorer.js"),
];

for (const baseDir of [root, path.join(root, "apps", "backend")]) {
  // Check regular node_modules
  const nm = path.join(baseDir, "node_modules");
  if (fs.existsSync(nm)) {
    const entries = fs.readdirSync(nm, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.startsWith("@nestjs+swagger")) continue;
      const full = path.join(nm, entry.name, "node_modules", "@nestjs", "swagger", "dist", "swagger-explorer.js");
      if (fs.existsSync(full)) possiblePaths.push(full);
    }
  }

  // Check Bun's isolated linker cache (.bun)
  const bunNm = path.join(baseDir, "node_modules", ".bun");
  if (fs.existsSync(bunNm)) {
    const entries = fs.readdirSync(bunNm, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.startsWith("@nestjs+swagger")) continue;
      const full = path.join(bunNm, entry.name, "node_modules", "@nestjs", "swagger", "dist", "swagger-explorer.js");
      if (fs.existsSync(full)) possiblePaths.push(full);
    }
  }
}

let swaggerExplorerPath = possiblePaths.find((p) => fs.existsSync(p));

if (!swaggerExplorerPath) {
  process.exit(0);
}

swaggerExplorerPath = fs.realpathSync(swaggerExplorerPath);

const source = fs.readFileSync(swaggerExplorerPath, "utf8");
const incompatibleImport = 'require("@nestjs/common/interfaces")';
const compatibleImport = 'require("@nestjs/common")';

if (!source.includes(incompatibleImport)) {
  process.exit(0);
}

fs.writeFileSync(
  swaggerExplorerPath,
  source.replace(incompatibleImport, compatibleImport),
);

console.log("Patched @nestjs/swagger for Nest 12 alpha compatibility.");
