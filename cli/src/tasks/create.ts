import c from '../colors';
import { Config } from '../definitions';
import { logFatal } from '../common';

export async function createCommand(config: Config) {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/app')}`,
  );
}
