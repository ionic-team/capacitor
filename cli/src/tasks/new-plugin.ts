import c from '../colors';
import { fatal } from '../errors';

export async function newPluginCommand(): Promise<void> {
  fatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${c.input('npm init @capacitor/plugin')}`,
  );
}
