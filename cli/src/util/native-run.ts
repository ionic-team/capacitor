import { dirname } from 'path';

import c from '../colors';
import { fatal } from '../errors';

import { resolveNode } from './node';
import { runCommand } from './subprocess';

import type { PlatformTarget } from '../common';
import type { RunCommandOptions } from './subprocess';

export async function runNativeRun(
  args: readonly string[],
  options: RunCommandOptions = {},
): Promise<string> {
  const p = resolveNode(
    __dirname,
    dirname('native-run/package'),
    'bin/native-run',
  );

  if (!p) {
    fatal(`${c.input('native-run')} not found.`);
  }

  return await runCommand(p, args, options);
}

export async function getPlatformTargets(
  platformName: string,
): Promise<PlatformTarget[]> {
  const output = await runNativeRun([platformName, '--list', '--json']);
  const parsedOutput = JSON.parse(output);

  return [
    ...parsedOutput.devices.map((t: any) => ({ ...t, virtual: false })),
    ...parsedOutput.virtualDevices.map((t: any) => ({ ...t, virtual: true })),
  ];
}
