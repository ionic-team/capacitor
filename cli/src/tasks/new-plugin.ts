import c from '../colors';
import { Config } from '../config';
import { logFatal } from '../common';

export async function newPluginCommand(config: Config) {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/plugin')}`,
  );
}
