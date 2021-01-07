import c from '../colors';
import { fatal } from '../errors';

export async function createCommand(): Promise<void> {
  fatal(
    `The create command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/app')}`,
  );
}
