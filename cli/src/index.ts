import program from 'commander';

import c from './colors';
import { loadConfig } from './config';
import { output, logFatal } from './log';
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
    .action(async () => {
      const { createCommand } = await import('./tasks/create');
      await createCommand();
    });

  program
    .command('init [appName] [appId]')
    .description(`create a ${c.strong('capacitor.config.json')} file`)
    .option(
      '--web-dir <value>',
      'Optional: Directory of your projects built web assets',
    )
    .action(async (appName, appId, { webDir }) => {
      const { initCommand } = await import('./tasks/init');
      await initCommand(config, appName, appId, webDir);
    });

  program
    .command('serve', { hidden: true })
    .description('Serves a Capacitor Progressive Web App in the browser')
    .action(async () => {
      const { serveCommand } = await import('./tasks/serve');
      await serveCommand();
    });

  program
    .command('sync [platform]')
    .description(`${c.input('copy')} + ${c.input('update')}`)
    .option(
      '--deployment',
      "Optional: if provided, Podfile.lock won't be deleted and pod install will use --deployment option",
    )
    .action(async (platform, { deployment }) => {
      const { syncCommand } = await import('./tasks/sync');
      await syncCommand(config, platform, deployment);
    });

  program
    .command('update [platform]')
    .description(
      `updates the native plugins and dependencies based on ${c.strong(
        'package.json',
      )}`,
    )
    .option(
      '--deployment',
      "Optional: if provided, Podfile.lock won't be deleted and pod install will use --deployment option",
    )
    .action(async (platform, { deployment }) => {
      const { updateCommand } = await import('./tasks/update');
      await updateCommand(config, platform, deployment);
    });

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .action(async platform => {
      const { copyCommand } = await import('./tasks/copy');
      await copyCommand(config, platform);
    });

  program
    .command(`run [platform]`)
    .description(
      `runs ${c.input('sync')}, then builds and deploys the native app`,
    )
    .option('--list', 'list targets, then quit')
    .option('--target <id>', 'use a specific target')
    .action(async (platform, { list, target }) => {
      const { runCommand } = await import('./tasks/run');
      await runCommand(config, platform, { list, target });
    });

  program
    .command('open [platform]')
    .description('opens the native project workspace (Xcode for iOS)')
    .action(async platform => {
      const { openCommand } = await import('./tasks/open');
      await openCommand(config, platform);
    });

  program
    .command('add [platform]')
    .description('add a native platform project')
    .action(async platform => {
      const { addCommand } = await import('./tasks/add');
      await addCommand(config, platform);
    });

  program
    .command('ls [platform]')
    .description('list installed Cordova and Capacitor plugins')
    .action(async platform => {
      const { listCommand } = await import('./tasks/list');
      await listCommand(config, platform);
    });

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(async platform => {
      const { doctorCommand } = await import('./tasks/doctor');
      await doctorCommand(config, platform);
    });

  program
    .command('plugin:generate', { hidden: true })
    .description('start a new Capacitor plugin')
    .action(async () => {
      const { newPluginCommand } = await import('./tasks/new-plugin');
      await newPluginCommand();
    });

  program.arguments('[command]').action(async cmd => {
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
