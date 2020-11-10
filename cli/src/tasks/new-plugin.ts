import { input } from '../colors';
import { logFatal } from '../common';

export async function newPluginCommand(): Promise<void> {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${input('npm init @capacitor/plugin')}`,
  );
}
