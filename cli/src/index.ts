#!/usr/bin/env bun
import { Command } from "commander";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { relative, resolve, join } from "node:path";
import { scan } from "./scan.js";
import { launchTui } from "./tui.js";
import {
  GLOBAL_CONFIG_PATH,
  projectConfigPath,
  resolveProjectRoot,
  resolveTemplateRoot,
  writeTemplateConfig,
} from "./config.js";
import { readSyncManifest, setSyncFileState, syncManifestPath } from "./manifest.js";

const program = new Command();

const RUNTIME_ASSET_PATTERN =
  /^(parser\.worker\.js|tree-sitter-.*\.wasm|highlights-.*\.scm|injections-.*\.scm)$/;

async function atomicCopyFile(source: string, dest: string, mode?: number): Promise<void> {
  const tmp = `${dest}.tmp`;
  await writeFile(tmp, await readFile(source));
  if (mode !== undefined) await chmod(tmp, mode);
  await rename(tmp, dest);
}

function fishCompletion(): string {
  return String.raw`# Fish completions for hillbilly

complete -c hillbilly -f
complete -c hillbilly -n "not __fish_seen_subcommand_from sync config completion upgrade help" -a sync -d "Sync template changes"
complete -c hillbilly -n "not __fish_seen_subcommand_from sync config completion upgrade help" -a upgrade -d "Upgrade hillbilly binary from template"
complete -c hillbilly -n "not __fish_seen_subcommand_from sync config completion upgrade help" -a config -d "Manage configuration"
complete -c hillbilly -n "not __fish_seen_subcommand_from sync config completion upgrade help" -a completion -d "Generate shell completions"

complete -c hillbilly -n "__fish_seen_subcommand_from sync; and not __fish_seen_subcommand_from push pull mark unmark list help" -a push -d "Push project changes to template"
complete -c hillbilly -n "__fish_seen_subcommand_from sync; and not __fish_seen_subcommand_from push pull mark unmark list help" -a pull -d "Pull template changes into project"
complete -c hillbilly -n "__fish_seen_subcommand_from sync; and not __fish_seen_subcommand_from push pull mark unmark list help" -a mark -d "Track files for sync"
complete -c hillbilly -n "__fish_seen_subcommand_from sync; and not __fish_seen_subcommand_from push pull mark unmark list help" -a unmark -d "Stop tracking files for sync"
complete -c hillbilly -n "__fish_seen_subcommand_from sync; and not __fish_seen_subcommand_from push pull mark unmark list help" -a list -d "List sync manifest files"

complete -c hillbilly -n "__fish_seen_subcommand_from push pull mark unmark list doctor set-template" -s p -l project -r -F -d "Generated project path"
complete -c hillbilly -n "__fish_seen_subcommand_from push doctor" -s t -l template -r -F -d "Hillbilly repo or template path"
complete -c hillbilly -n "__fish_seen_subcommand_from pull" -s r -l vcs-ref -r -d "Template git ref"
complete -c hillbilly -n "__fish_seen_subcommand_from pull" -l recopy -d "Use copier recopy"

complete -c hillbilly -n "__fish_seen_subcommand_from config; and not __fish_seen_subcommand_from set-template doctor help" -a set-template -d "Set template repo path"
complete -c hillbilly -n "__fish_seen_subcommand_from config; and not __fish_seen_subcommand_from set-template doctor help" -a doctor -d "Show template resolution"
complete -c hillbilly -n "__fish_seen_subcommand_from set-template" -l global -d "Write global config"
complete -c hillbilly -n "__fish_seen_subcommand_from set-template" -l template-subdir -r -F -d "Template subdirectory"

complete -c hillbilly -n "__fish_seen_subcommand_from completion; and not __fish_seen_subcommand_from fish help" -a fish -d "Generate Fish completions"

# sync mark/unmark take project files.
complete -c hillbilly -n "__fish_seen_subcommand_from mark" -F
complete -c hillbilly -n "__fish_seen_subcommand_from unmark" -F
`;
}

program
  .name("hillbilly")
  .description("Hillbilly template sync tool — push/pull boilerplate changes")
  .version("0.0.0");

program
  .command("completion")
  .description("Generate shell completions")
  .argument("<shell>", "Shell to generate completions for (fish)")
  .action((shell: string) => {
    if (shell !== "fish") {
      console.error(`Unsupported shell: ${shell}`);
      process.exit(1);
    }
    console.log(fishCompletion());
  });

// ---------------------------------------------------------------------------
// sync (subcommand group)
// ---------------------------------------------------------------------------
const sync = program
  .command("sync")
  .description("Sync template changes between a generated project and the Hillbilly template");

sync
  .command("push")
  .description("Interactively push template-owned changes back to the Hillbilly template")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .option("-t, --template <path>", "Path to the Hillbilly repo or template directory")
  .action(async (options: { project: string; template?: string }) => {
    const result = await scan(options.project, { template: options.template });

    if (result.files.length === 0) {
      console.log("No template-owned changes found.");
      return;
    }

    await launchTui(result, () => scan(options.project, { template: options.template }));
  });

sync
  .command("mark")
  .description("Track project files in .hillbilly-sync.yml")
  .argument("<files...>", "Files to track for sync")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .action(async (files: string[], options: { project: string }) => {
    const projectRoot = resolveProjectRoot(options.project);
    const existingManifest = await readSyncManifest(projectRoot);
    const previouslyTracked = new Set(
      existingManifest.files.filter((file) => file.state === "tracked").map((file) => file.path),
    );
    const existingFiles: string[] = [];

    for (const file of files) {
      const filePath = resolve(process.cwd(), file);
      if (!existsSync(filePath)) {
        console.error(`Missing: ${file}`);
        continue;
      }
      existingFiles.push(relative(projectRoot, filePath).replaceAll("\\", "/"));
    }

    if (existingFiles.length === 0) return;

    const manifest = await setSyncFileState(projectRoot, existingFiles, "tracked");
    console.log(`Updated ${syncManifestPath(projectRoot)}`);
    for (const file of manifest.files.filter(
      (entry) =>
        existingFiles.includes(entry.path) ||
        existingFiles.some((raw) => resolve(projectRoot, raw) === resolve(projectRoot, entry.path)),
    )) {
      console.log(
        `${previouslyTracked.has(file.path) ? "Already tracked" : "Tracked"}: ${file.path}`,
      );
    }
  });

sync
  .command("unmark")
  .description("Stop tracking project files while keeping tombstones")
  .argument("<files...>", "Files to untrack for sync")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .action(async (files: string[], options: { project: string }) => {
    const projectRoot = resolveProjectRoot(options.project);
    await setSyncFileState(projectRoot, files, "untracked");
    console.log(`Updated ${syncManifestPath(projectRoot)}`);
    for (const file of files) console.log(`Untracked: ${file}`);
  });

sync
  .command("list")
  .description("List files in .hillbilly-sync.yml")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .action(async (options: { project: string }) => {
    const projectRoot = resolveProjectRoot(options.project);
    const manifest = await readSyncManifest(projectRoot);
    console.log(syncManifestPath(projectRoot));
    for (const file of manifest.files) console.log(`${file.state.padEnd(9)} ${file.path}`);
  });

sync
  .command("pull")
  .description("Pull template updates into the project (runs copier update by default)")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .option("-r, --vcs-ref <ref>", "Template git ref to pull", "HEAD")
  .option("--recopy", "Use copier recopy instead of update when the old _commit is unavailable")
  .action(async (options: { project: string; vcsRef: string; recopy?: boolean }) => {
    const projectRoot = resolveProjectRoot(options.project);
    const manifestPath = syncManifestPath(projectRoot);
    const manifestBackup = existsSync(manifestPath) ? await readFile(manifestPath) : null;
    const copierCommand = options.recopy ? "recopy" : "update";
    console.log(
      `Running copier ${copierCommand} --vcs-ref ${options.vcsRef} in ${projectRoot}...`,
    );
    const proc = Bun.spawn(["copier", copierCommand, "--vcs-ref", options.vcsRef], {
      cwd: projectRoot,
      stdio: ["inherit", "inherit", "inherit"],
    });
    const exitCode = await proc.exited;

    if (manifestBackup) {
      await writeFile(manifestPath, manifestBackup);
      console.log(`Restored project sync manifest: ${manifestPath}`);
    } else if (existsSync(manifestPath)) {
      await unlink(manifestPath);
    }

    if (exitCode !== 0 && !options.recopy) {
      console.error(`
Copier update failed. If the traceback says the old _commit could not be checked out,
the generated project points at a template commit that no longer exists locally.

You have two options:

  1. Restore/fetch that old template commit, then rerun:
     hillbilly sync pull

  2. Re-render from the current template, accepting Copier recopy semantics:
     hillbilly sync pull --recopy

Recopy ignores the old template diff and may overwrite generated-project files.
Review your git diff afterwards.
`);
    }

    process.exit(exitCode ?? 1);
  });

// ---------------------------------------------------------------------------
// upgrade (standalone command)
// ---------------------------------------------------------------------------
program
  .command("upgrade")
  .description("Copy the latest hillbilly binary from the template into this project")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .option("-t, --template <path>", "Path to the Hillbilly repo or template directory")
  .action(async (options: { project: string; template?: string }) => {
    const projectRoot = resolveProjectRoot(options.project);
    const { templateRoot, source } = await resolveTemplateRoot(projectRoot, {
      template: options.template,
    });

    const sourceBinary = join(templateRoot, "bin", "hillbilly");
    if (!existsSync(sourceBinary)) {
      console.error(`No binary found at ${sourceBinary}`);
      console.error(`Template source: ${source} → ${templateRoot}`);
      console.error("Run `bun run build` in the hillbilly CLI directory first.");
      process.exit(1);
    }

    const destDir = join(projectRoot, "bin");
    const destBinary = join(destDir, "hillbilly");

    await mkdir(destDir, { recursive: true });

    // Write to a temp file then atomically rename — handles the case
    // where the destination binary is currently executing (ETXTBSY on copyFile).
    await atomicCopyFile(sourceBinary, destBinary, 0o755);

    const sourceBinDir = join(templateRoot, "bin");
    const copiedAssets: string[] = [];
    for (const entry of await readdir(sourceBinDir)) {
      if (!RUNTIME_ASSET_PATTERN.test(entry)) continue;
      const sourceAsset = join(sourceBinDir, entry);
      const destAsset = join(destDir, entry);
      await atomicCopyFile(sourceAsset, destAsset);
      copiedAssets.push(destAsset);
    }

    console.log(`Upgraded hillbilly binary from ${sourceBinary}`);
    console.log(`  → ${destBinary}`);
    for (const asset of copiedAssets) console.log(`  → ${asset}`);
  });

// ---------------------------------------------------------------------------
// config (subcommand group)
// ---------------------------------------------------------------------------
const config = program.command("config").description("Manage Hillbilly CLI configuration");

config
  .command("set-template")
  .argument("<path>", "Path to the local Hillbilly repo or template directory")
  .description("Store the template source path for this project or globally")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .option("--global", "Write to ~/.config/hillbilly/config.yml instead of .hillbilly.yml")
  .option("--template-subdir <path>", "Template subdirectory inside the repo", "template")
  .action(
    async (
      templatePath: string,
      options: { project: string; global?: boolean; templateSubdir: string },
    ) => {
      const configPath = options.global
        ? GLOBAL_CONFIG_PATH
        : projectConfigPath(resolveProjectRoot(options.project));
      await writeTemplateConfig(configPath, templatePath, options.templateSubdir);
      console.log(`Wrote ${configPath}`);
    },
  );

config
  .command("doctor")
  .description("Show how the CLI resolves the template source")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .option("-t, --template <path>", "Path to the Hillbilly repo or template directory")
  .action(async (options: { project: string; template?: string }) => {
    const projectRoot = resolveProjectRoot(options.project);
    console.log(`Project: ${projectRoot}`);
    console.log(
      `Project config: ${projectConfigPath(projectRoot)} ${existsSync(projectConfigPath(projectRoot)) ? "✓" : "-"}`,
    );
    console.log(
      `Global config: ${GLOBAL_CONFIG_PATH} ${existsSync(GLOBAL_CONFIG_PATH) ? "✓" : "-"}`,
    );

    const resolution = await resolveTemplateRoot(projectRoot, { template: options.template });
    console.log(`Template: ${resolution.templateRoot}`);
    console.log(
      `Source: ${resolution.source}${resolution.configPath ? ` (${resolution.configPath})` : ""}`,
    );
    console.log(`Exists: ${existsSync(resolution.templateRoot) ? "yes" : "no"}`);
  });

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------
await program.parseAsync(process.argv);
