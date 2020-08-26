import { Config } from '../config';
import { logFatal, logError } from '../common';
import kleur from 'kleur';

export async function serveCommand(config: Config) {
  logFatal(
    `The serve command has been removed.\n` +
      `Use a third-party tool for serving single page apps, such as ${kleur.yellow(
        'serve',
      )}: https://www.npmjs.com/package/serve`,
  );
}
