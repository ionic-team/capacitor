import c from '../colors';
import { logFatal } from '../common';
import type { Config } from '../config';

export async function newPluginCommand(config: Config): Promise<void> {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/plugin')}`,
  );
}
