import { Config } from '../config';
import { logFatal } from '../common';
import kleur from 'kleur';

export async function createCommand(config: Config) {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${kleur.bold('npm init @capacitor/app')}`,
  );
}
