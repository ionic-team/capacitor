import { resolve } from 'path';
import kleur from 'kleur';
import Debug from 'debug';
import * as help from './help';

import { emoji, isTTY } from './cli';
import { exists } from './fs';
import { getOptions } from './options';
import { gatherDetails } from './prompt';
import { extractTemplate } from './template';

const debug = Debug('@capacitor/create-app');

process.on('unhandledRejection', error => {
  process.stderr.write(`ERR: ${error}\n`);
  process.exit(1);
});

export const run = async () => {
  if (process.argv.find(arg => ['-h', '-?', '--help'].includes(arg))) {
    help.run();
    process.exit();
  }

  const options = getOptions();
  debug('options from command-line: %O', options);

  if (Object.values(options).includes(undefined)) {
    if (isTTY) {
      debug(`Missing/invalid options. Prompting for user input...`);
    } else {
      process.stderr.write(
        `ERR: Refusing to prompt for missing/invalid options in non-TTY environment.\n` +
          `See ${kleur.bold('--help')}. Run with ${kleur.bold(
            '--verbose',
          )} for more context.\n`,
      );
      process.exit(1);
    }
  }

  const details = await gatherDetails(options);
  const appdir = resolve(process.cwd(), details.dir);

  if (await exists(appdir)) {
    process.stderr.write(
      `ERR: Not overwriting existing directory: ${kleur.bold(details.dir)}`,
    );
    process.exit(1);
  }

  await extractTemplate(appdir, details);

  const tada = emoji('🎉', '*');

  process.stdout.write(`
${kleur.bold(`${tada} Your Capacitor app is ready to go! ${tada}`)}

Next steps:
  - ${kleur.bold(`cd ${details.dir}/`)}
  - install dependencies (e.g. w/ ${kleur.bold('npm install')})
  - ${kleur.bold('npx cap sync')}
`);
};
