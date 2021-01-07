import c from '../colors';
import { fatal } from '../errors';

export async function serveCommand(): Promise<void> {
  fatal(
    `The serve command has been removed.\n` +
      `Use a third-party tool for serving single page apps, such as ${c.strong(
        'serve',
      )}: ${c.strong('https://www.npmjs.com/package/serve')}`,
  );
}
