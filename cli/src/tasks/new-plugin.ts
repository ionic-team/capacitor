import c from '../colors.js';
import { fatal } from '../errors.js';

export async function newPluginCommand(): Promise<void> {
  fatal(`The plugin:generate command has been removed.\n` + `Use ${c.input('npm init @capacitor/plugin')}`);
}
