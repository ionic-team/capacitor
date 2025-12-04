import c from '../colors.js';
import { fatal } from '../errors.js';

export async function createCommand(): Promise<void> {
  fatal(`The create command has been removed.\n` + `Use ${c.input('npm init @capacitor/app')}`);
}
