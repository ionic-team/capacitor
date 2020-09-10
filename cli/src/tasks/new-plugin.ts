import c from '../colors';
import { Config } from '../definitions';
import { logFatal } from '../common';

export async function newPluginCommand(config: Config) {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/plugin')}`,
  );
}
