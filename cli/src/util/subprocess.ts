import { Subprocess, SubprocessError, which } from '@ionic/utils-subprocess';

export interface RunCommandOptions {
  cwd?: string;
}

export async function runCommand(
  command: string,
  args: readonly string[],
  options: RunCommandOptions = {},
): Promise<string> {
  const p = new Subprocess(command, args, options);

  try {
    return await p.output();
  } catch (e) {
    if (e instanceof SubprocessError) {
      // old behavior of just throwing the stdout/stderr strings
      throw e.output
        ? e.output
        : e.code
        ? e.code
        : e.error
        ? e.error.message
        : 'Unknown error';
    }

    throw e;
  }
}

export async function getCommandOutput(
  command: string,
  args: readonly string[],
  options: RunCommandOptions = {},
): Promise<string | null> {
  try {
    return (await runCommand(command, args, options)).trim();
  } catch (e) {
    return null;
  }
}

export async function isInstalled(command: string): Promise<boolean> {
  try {
    await which(command);
  } catch (e) {
    return false;
  }

  return true;
}
