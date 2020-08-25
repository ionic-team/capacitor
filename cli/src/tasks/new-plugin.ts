import { Config } from '../config';
import { logFatal } from '../common';
import chalk from 'chalk';

export async function newPluginCommand(config: Config) {
  logFatal(
    `The plugin:generate command has been removed.\n` +
      `Use ${chalk.bold('npm init @capacitor/plugin')}`,
  );
}
