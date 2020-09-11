import c from '../colors';
import { logFatal } from '../common';
import { Config } from '../config';

export async function createCommand(config: Config) {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/app')}`,
  );
}
