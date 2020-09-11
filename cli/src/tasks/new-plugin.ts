import c from '../colors';
import { logFatal } from '../common';
import { Config } from '../config';

export async function newPluginCommand(config: Config) {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/plugin')}`,
  );
}
