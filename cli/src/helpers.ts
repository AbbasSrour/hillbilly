import { chmod, mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { relative, resolve, join } from "node:path";

export async function atomicCopyFile(source: string, dest: string, mode?: number): Promise<void> {
  const tmp = `${dest}.tmp`;
  await writeFile(tmp, await readFile(source));
  if (mode !== undefined) await chmod(tmp, mode);
  await rename(tmp, dest);
}

export async function expandMarkPath(projectRoot: string, input: string): Promise<string[]> {
  const absolutePath = resolve(projectRoot, input);
  const info = await stat(absolutePath);
  if (!info.isDirectory()) return [relative(projectRoot, absolutePath).replaceAll("\\", "/")];

  const paths: string[] = [];
  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        paths.push(relative(projectRoot, fullPath).replaceAll("\\", "/"));
      }
    }
  }

  await walk(absolutePath);
  return paths;
}

export function fishCompletion(): string {
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
