import { dirname } from 'path';

import c from '../colors.js';
import type { PlatformTarget } from '../common.js';
import { fatal } from '../errors.js';
import { logger } from '../log.js';

import { resolveNode } from './node.js';
import { runCommand } from './subprocess.js';
import type { RunCommandOptions } from './subprocess.js';

export async function runNativeRun(args: readonly string[], options: RunCommandOptions = {}): Promise<string> {
  const p = resolveNode(__dirname, dirname('native-run/package'), 'bin/native-run');

  if (!p) {
    fatal(`${c.input('native-run')} not found.`);
  }

  if (process.versions.pnp) {
    return await runCommand('yarn', ['node', p, ...args], options);
  } else {
    return await runCommand(p, args, options);
  }
}

export async function getPlatformTargets(platformName: string): Promise<PlatformTarget[]> {
  const errors = [];
  try {
    const output = await runNativeRun([platformName, '--list', '--json']);
    const parsedOutput = JSON.parse(output);
    if (parsedOutput.devices.length || parsedOutput.virtualDevices.length) {
      return [
        ...parsedOutput.devices.map((t: any) => ({ ...t, virtual: false })),
        ...parsedOutput.virtualDevices.map((t: any) => ({
          ...t,
          virtual: true,
        })),
      ];
    } else {
      parsedOutput.errors.map((e: any) => {
        errors.push(e);
      });
    }
  } catch (e: any) {
    const err = JSON.parse(e);
    errors.push(err);
  }

  if (errors.length === 0) {
    logger.info('No devices found.');
    return [];
  }

  const plural = errors.length > 1 ? 's' : '';
  const errMsg = `${c.strong('native-run')} failed with error${plural}\n
  ${errors
    .map((e: any) => {
      return `\t${c.strong(e.code)}: ${e.error}`;
    })
    .join('\n')}
  \n\tMore details for this error${plural} may be available online: ${c.strong(
    'https://github.com/ionic-team/native-run/wiki/Android-Errors',
  )}
  `;
  throw errMsg;
}
