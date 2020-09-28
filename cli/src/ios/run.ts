import type { Config } from '../definitions';
import type { RunCommandOptions } from '../tasks/run';

export async function runIOS(
  config: Config,
  options: RunCommandOptions,
): Promise<void> {
  console.log('run ios!');
}
