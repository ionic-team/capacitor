import { input } from '../colors';
import { logFatal } from '../common';

export async function createCommand(): Promise<void> {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${input('npm init @capacitor/app')}`,
  );
}
