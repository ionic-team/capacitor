import { strong } from '../colors';
import { logFatal } from '../common';

export async function serveCommand(): Promise<void> {
  logFatal(
    `The serve command has been removed.\n` +
      `Use a third-party tool for serving single page apps, such as ${strong(
        'serve',
      )}: ${strong('https://www.npmjs.com/package/serve')}`,
  );
}
