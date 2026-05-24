#!/usr/bin/env bun
import { Command } from "commander";
import { scan } from "./scan.js";
import { launchTui } from "./tui.js";

const program = new Command();

program
  .name("hillbilly")
  .description("Hillbilly template sync tool — push/pull boilerplate changes")
  .version("0.0.0");

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
  .action(async (options: { project: string }) => {
    const result = await scan(options.project);

    if (result.files.length === 0) {
      console.log("No template-owned changes found.");
      return;
    }

    await launchTui(result);
  });

sync
  .command("pull")
  .description("Pull template updates into the project (runs copier update)")
  .option("-p, --project <path>", "Path to the generated project", process.cwd())
  .action(async (options: { project: string }) => {
    console.log(`Running copier update in ${options.project}...`);
    const proc = Bun.spawn(["copier", "update"], {
      cwd: options.project,
      stdio: ["inherit", "inherit", "inherit"],
    });
    const exitCode = await proc.exited;
    process.exit(exitCode ?? 1);
  });

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------
await program.parseAsync(process.argv);
