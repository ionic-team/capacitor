import program from 'commander';

import c from './colors';
import { logFatal } from './common';
import { loadConfig } from './config';
import { output } from './log';
import { addCommand } from './tasks/add';
import { copyCommand } from './tasks/copy';
import { createCommand } from './tasks/create';
import { doctorCommand } from './tasks/doctor';
import { initCommand } from './tasks/init';
import { listCommand } from './tasks/list';
import { newPluginCommand } from './tasks/new-plugin';
import { openCommand } from './tasks/open';
import { serveCommand } from './tasks/serve';
import { syncCommand } from './tasks/sync';
import { updateCommand } from './tasks/update';
import { emoji as _e } from './util/emoji';

process.on('unhandledRejection', error => {
  console.error(c.failure('[fatal]'), error);
});

export async function run(): Promise<void> {
  const config = await loadConfig();

  program.version(config.cli.package.version);

  program
    .command('create [directory] [name] [id]', { hidden: true })
    .description('Creates a new Capacitor project')
    .action(() => {
      return createCommand(config);
    });

  program
    .command('init [appName] [appId]')
    .description('create a capacitor.config.json file')
    .option(
      '--web-dir <value>',
      'Optional: Directory of your projects built web assets',
    )
    .action((appName, appId, { webDir }) => {
      return initCommand(config, appName, appId, webDir);
    });

  program
    .command('serve', { hidden: true })
    .description('Serves a Capacitor Progressive Web App in the browser')
    .action(() => {
      return serveCommand(config);
    });

  program
    .command('sync [platform]')
    .description('copy + update')
    .option(
      '--deployment',
      "Optional: if provided, Podfile.lock won't be deleted and pod install will use --deployment option",
    )
    .action((platform, { deployment }) => {
      return syncCommand(config, platform, deployment);
    });

  program
    .command('update [platform]')
    .description(
      `updates the native plugins and dependencies based in package.json`,
    )
    .option(
      '--deployment',
      "Optional: if provided, Podfile.lock won't be deleted and pod install will use --deployment option",
    )
    .action((platform, { deployment }) => {
      return updateCommand(config, platform, deployment);
    });

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .action(platform => {
      return copyCommand(config, platform);
    });

  program
    .command('open [platform]')
    .description('opens the native project workspace (xcode for iOS)')
    .action(platform => {
      return openCommand(config, platform);
    });

  program
    .command('add [platform]')
    .description('add a native platform project')
    .action(platform => {
      return addCommand(config, platform);
    });

  program
    .command('ls [platform]')
    .description('list installed Cordova and Capacitor plugins')
    .action(platform => {
      return listCommand(config, platform);
    });

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(platform => {
      return doctorCommand(config, platform);
    });

  program
    .command('plugin:generate', { hidden: true })
    .description('start a new Capacitor plugin')
    .action(() => {
      return newPluginCommand(config);
    });

  program.arguments('[command]').action(cmd => {
    if (typeof cmd === 'undefined') {
      output.write(
        `\n  ${_e('⚡️', '--')}  ${c.strong(
          'Capacitor - Cross-Platform apps with JavaScript and the Web',
        )}  ${_e('⚡️', '--')}\n\n`,
      );
      program.outputHelp();
    } else {
      logFatal(`Unknown command: ${c.input(cmd)}`);
    }
  });

  program.parse(process.argv);
}
