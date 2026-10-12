import { existsSync, readJSON } from 'fs-extra';
import { join } from 'path';

import c from '../colors';
import { output } from '../log';

import { getCommandOutput } from './subprocess';

export interface BlockedInstallScript {
  name: string;
  version: string;
}

const LOCKFILE_MANAGERS: ReadonlyArray<[string, string]> = [
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
];

/**
 * `npm install-scripts ls` compares the tree against npm's own `allowScripts` map, which yarn and
 * pnpm never write. It therefore reports every install script in a yarn or pnpm project as
 * blocked, even when that package manager ran it, so the check has to know who did the install.
 */
export async function isNpmProject(rootDir: string): Promise<boolean> {
  try {
    const { packageManager } = await readJSON(join(rootDir, 'package.json'));
    if (typeof packageManager === 'string') {
      return packageManager.split('@')[0] === 'npm';
    }
  } catch (e) {
    // no package.json, or an unreadable one: fall through to the lockfiles
  }

  for (const [lockfile, manager] of LOCKFILE_MANAGERS) {
    if (existsSync(join(rootDir, lockfile))) {
      return manager === 'npm';
    }
  }

  return true;
}

/**
 * npm 12 blocks dependency install scripts by default and still exits 0, so the only reliable
 * signal is to ask npm directly. `npm install-scripts ls` lists every package whose scripts are
 * still awaiting a decision, and does not exist before npm 12, where the command exits non-zero
 * and `getCommandOutput` hands back null.
 *
 * Pass `packageManager` when the caller already knows which one ran the install; otherwise it is
 * inferred from the project.
 */
export async function getBlockedInstallScripts(
  rootDir: string,
  packageManager?: string,
): Promise<BlockedInstallScript[]> {
  const isNpm = packageManager === undefined ? await isNpmProject(rootDir) : packageManager === 'npm';

  if (!isNpm) {
    return [];
  }

  return parseBlockedInstallScripts(
    await getCommandOutput('npm', ['install-scripts', 'ls', '--json'], { cwd: rootDir }),
  );
}

export function parseBlockedInstallScripts(commandOutput: string | null): BlockedInstallScript[] {
  if (!commandOutput) {
    return [];
  }

  let parsed: any;
  try {
    parsed = JSON.parse(commandOutput);
  } catch (e) {
    return [];
  }

  if (!Array.isArray(parsed?.allowScripts)) {
    return [];
  }

  const blocked: BlockedInstallScript[] = [];

  for (const entry of parsed.allowScripts) {
    const name = entry?.name;
    if (typeof name !== 'string' || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      if (change?.change !== 'pending' || typeof change.key !== 'string') {
        continue;
      }

      blocked.push({
        name,
        version: change.key.startsWith(`${name}@`) ? change.key.slice(name.length + 1) : change.key,
      });
    }
  }

  return blocked;
}

export function logBlockedInstallScripts(blocked: BlockedInstallScript[]): void {
  if (blocked.length === 0) {
    return;
  }

  const packages = blocked.map(({ name, version }) => `    ${c.strong(`${name}@${version}`)}\n`).join('');
  const approvals = [...new Set(blocked.map(({ name }) => name))]
    .map((name) => `    ${c.input(`npm install-scripts approve ${name}`)}\n`)
    .join('');

  output.write(
    `${c.strong('Blocked Install Scripts:')}\n\n` +
      `  npm blocked install scripts for ${blocked.length === 1 ? '1 package' : `${blocked.length} packages`}. ` +
      `Features that rely on them may not work.\n\n` +
      packages +
      `\n  To allow them, run:\n\n` +
      approvals +
      `    ${c.input('npm rebuild')}\n\n` +
      `  ${c.weak('Approvals are pinned to an exact version, so repeat this after upgrading the package.')}\n\n`,
  );
}
