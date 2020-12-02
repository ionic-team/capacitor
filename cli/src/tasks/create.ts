import c from '../colors';
import { logFatal } from '../log';

export async function createCommand(): Promise<void> {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/app')}`,
  );
}
