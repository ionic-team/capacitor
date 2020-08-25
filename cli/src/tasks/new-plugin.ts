import { Config } from '../config';
import { logFatal } from '../common';
import kleur from 'kleur';

export async function newPluginCommand(config: Config) {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${kleur.bold('npm init @capacitor/plugin')}`,
  );
}
