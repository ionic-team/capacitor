import { Config } from '../config';
import { logFatal } from '../common';
import chalk from 'chalk';

export async function createCommand(config: Config) {
  logFatal(
    `The create command has been removed.\n` +
      `Use ${chalk.bold('npm init @capacitor/app')}`,
  );
}
