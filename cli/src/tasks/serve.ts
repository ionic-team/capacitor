import c from '../colors';
import { Config } from '../config';
import { logFatal } from '../common';

export async function serveCommand(config: Config) {
  logFatal(
    `The serve command has been removed.\n` +
      `Use a third-party tool for serving single page apps, such as ${c.strong(
        'serve',
      )}: ${c.strong('https://www.npmjs.com/package/serve')}`,
  );
}
