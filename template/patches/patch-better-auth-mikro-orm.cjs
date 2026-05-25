const fs = require("node:fs");
const path = require("node:path");

// TODO: Remove this postinstall patch when better-auth-mikro-orm publishes a
// version that handles ManyToMany relations in getPropertyMetadata et al.

const root = process.cwd();
const backendPackageJson = path.join(root, "apps", "backend", "package.json");

if (!fs.existsSync(backendPackageJson)) {
  process.exit(0);
}

const adapterUtilsName = "better-auth-mikro-orm";
const targetFile = path.join("lib", "utils", "adapterUtils.js");

function findAdapterFile(baseDir) {
  const nm = path.join(baseDir, "node_modules");
  if (!fs.existsSync(nm)) return null;

  // Check Bun's isolated linker cache (.bun)
  const bunNm = path.join(nm, ".bun");
  if (fs.existsSync(bunNm)) {
    const entries = fs.readdirSync(bunNm, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.startsWith(adapterUtilsName)) continue;
      const full = path.join(bunNm, entry.name, "node_modules", adapterUtilsName, targetFile);
      if (fs.existsSync(full)) return fs.realpathSync(full);
    }
  }

  return null;
}

const adapterFile =
  findAdapterFile(root) ||
  findAdapterFile(path.join(root, "apps", "backend"));

if (!adapterFile) {
  process.exit(0);
}

let source = fs.readFileSync(adapterFile, "utf8");
let modified = false;

// 1. Add MANY_TO_MANY to ownReferences
const oldOwnRefs = `const ownReferences = [
    ReferenceKind.SCALAR,
    ReferenceKind.ONE_TO_MANY,
    ReferenceKind.EMBEDDED
];`;

const newOwnRefs = `const ownReferences = [
    ReferenceKind.SCALAR,
    ReferenceKind.ONE_TO_MANY,
    ReferenceKind.MANY_TO_MANY,
    ReferenceKind.EMBEDDED
];`;

if (source.includes(oldOwnRefs) && !source.includes("ReferenceKind.MANY_TO_MANY")) {
  source = source.replace(oldOwnRefs, newOwnRefs);
  modified = true;
}

// 2. Handle MANY_TO_MANY in getFieldPath
const oldFieldPath = `if (prop.kind === ReferenceKind.SCALAR ||
            prop.kind === ReferenceKind.EMBEDDED) {`;

const newFieldPath = `if (prop.kind === ReferenceKind.SCALAR ||
            prop.kind === ReferenceKind.EMBEDDED ||
            prop.kind === ReferenceKind.MANY_TO_MANY) {`;

if (source.includes(oldFieldPath) && !source.includes("ReferenceKind.MANY_TO_MANY")) {
  source = source.replace(oldFieldPath, newFieldPath);
  modified = true;
}

// 3. Handle MANY_TO_MANY in normalizePropertyValue
const oldNormProp = `if (!property.targetMeta ||
            property.kind === ReferenceKind.SCALAR ||
            property.kind === ReferenceKind.EMBEDDED) {`;

const newNormProp = `if (!property.targetMeta ||
            property.kind === ReferenceKind.SCALAR ||
            property.kind === ReferenceKind.EMBEDDED ||
            property.kind === ReferenceKind.MANY_TO_MANY) {`;

if (source.includes(oldNormProp) && !source.includes("ReferenceKind.MANY_TO_MANY")) {
  source = source.replace(oldNormProp, newNormProp);
  modified = true;
}

if (modified) {
  fs.writeFileSync(adapterFile, source);
  console.log("Patched better-auth-mikro-orm for ManyToMany relation support.");
} else {
  console.log("better-auth-mikro-orm already patched or not applicable.");
}
