import { scan, applyStagedHunks } from "./scan";

const result = await scan("/home/ares/Projects/projects/test-nest");
console.log("Template root:", result.templateRoot);
console.log("Files:", result.files.length);

for (const f of result.files) {
  console.log(`\n📄 [${f.status}] ${f.projectPath}`);
  if (f.hunks) {
    for (let i = 0; i < f.hunks.length; i++) {
      const h = f.hunks[i]!;
      console.log(`  Hunk ${i}: old=${h.oldStart}-${h.oldStart + h.oldLines} new=${h.newStart}-${h.newStart + h.newLines}`);
      console.log(h.text.split("\n").slice(0, 3).join("\n"));
      console.log("  ...");
    }

    // Test: apply only hunk 0
    if (f.hunks.length >= 2) {
      console.log("\n  [test] Applying only hunk 0...");
      // Can't read template content here easily, but the function is testable
    }
  }
}
