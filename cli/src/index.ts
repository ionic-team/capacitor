import program from 'commander';

import c from './colors';
import { loadConfig } from './config';
import { fatal, isFatal } from './errors';
import { receive } from './ipc';
import { logger, output } from './log';
import { telemetryAction } from './telemetry';
import { wrapAction } from './util/cli';
import { emoji as _e } from './util/emoji';

import type { Config } from './definitions';

process.on('unhandledRejection', error => {
  console.error(c.failure('[fatal]'), error);
});

process.on('message', receive);

export async function run(): Promise<void> {
  try {
    const config = await loadConfig();
    runProgram(config);
  } catch (e) {
    process.exitCode = isFatal(e) ? e.exitCode : 1;
    logger.error(e.message ? e.message : String(e));
  }
}

export function runProgram(config: Config): void {
  program.version(config.cli.package.version);

  program
    .command('config', { hidden: true })
    .description(`print evaluated Capacitor config`)
    .option('--json', 'Print in JSON format')
    .action(
      wrapAction(async ({ json }) => {
        const { configCommand } = await import('./tasks/config');
        await configCommand(config, json);
      }),
    );

  program
    .command('create [directory] [name] [id]', { hidden: true })
    .description('Creates a new Capacitor project')
    .action(
      wrapAction(async () => {
        const { createCommand } = await import('./tasks/create');
        await createCommand();
      }),
    );

  program
    .command('init [appName] [appId]')
    .description(`Initialize Capacitor configuration`)
    .option(
      '--web-dir <value>',
      'Optional: Directory of your projects built web assets',
    )
    .action(
      wrapAction(
        telemetryAction(config, async (appName, appId, { webDir }) => {
          const { initCommand } = await import('./tasks/init');
          await initCommand(config, appName, appId, webDir);
        }),
      ),
    );

  program
    .command('serve', { hidden: true })
    .description('Serves a Capacitor Progressive Web App in the browser')
    .action(
      wrapAction(async () => {
        const { serveCommand } = await import('./tasks/serve');
        await serveCommand();
      }),
    );

  program
    .command('sync [platform]')
    .description(`${c.input('copy')} + ${c.input('update')}`)
    .option(
      '--deployment',
      "Optional: if provided, Podfile.lock won't be deleted and pod install will use --deployment option",
    )
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { deployment }) => {
          const { syncCommand } = await import('./tasks/sync');
          await syncCommand(config, platform, deployment);
        }),
      ),
    );

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
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { deployment }) => {
          const { updateCommand } = await import('./tasks/update');
          await updateCommand(config, platform, deployment);
        }),
      ),
    );

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .action(
      wrapAction(
        telemetryAction(config, async platform => {
          const { copyCommand } = await import('./tasks/copy');
          await copyCommand(config, platform);
        }),
      ),
    );

  program
    .command(`run [platform]`)
    .description(
      `runs ${c.input('sync')}, then builds and deploys the native app`,
    )
    .option('--list', 'list targets, then quit')
    // TODO: remove once --json is a hidden option (https://github.com/tj/commander.js/issues/1106)
    .allowUnknownOption(true)
    .option('--target <id>', 'use a specific target')
    .option('--no-sync', `do not run ${c.input('sync')}`)
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { list, target, sync }) => {
          const { runCommand } = await import('./tasks/run');
          await runCommand(config, platform, { list, target, sync });
        }),
      ),
    );

  program
    .command('open [platform]')
    .description('opens the native project workspace (Xcode for iOS)')
    .action(
      wrapAction(
        telemetryAction(config, async platform => {
          const { openCommand } = await import('./tasks/open');
          await openCommand(config, platform);
        }),
      ),
    );

  program
    .command('add [platform]')
    .description('add a native platform project')
    .action(
      wrapAction(
        telemetryAction(config, async platform => {
          const { addCommand } = await import('./tasks/add');
          await addCommand(config, platform);
        }),
      ),
    );

  program
    .command('ls [platform]')
    .description('list installed Cordova and Capacitor plugins')
    .action(
      wrapAction(
        telemetryAction(config, async platform => {
          const { listCommand } = await import('./tasks/list');
          await listCommand(config, platform);
        }),
      ),
    );

  program
    .command('doctor [platform]')
    .description('checks the current setup for common errors')
    .action(
      wrapAction(
        telemetryAction(config, async platform => {
          const { doctorCommand } = await import('./tasks/doctor');
          await doctorCommand(config, platform);
        }),
      ),
    );

  program
    .command('telemetry [on|off]', { hidden: true })
    .description('enable or disable telemetry')
    .action(
      wrapAction(async onOrOff => {
        const { telemetryCommand } = await import('./tasks/telemetry');
        await telemetryCommand(onOrOff);
      }),
    );

  program
    .command('📡', { hidden: true })
    .description('IPC receiver command')
    .action(() => {
      // no-op: IPC messages are received via `process.on('message')`
    });

  program
    .command('plugin:generate', { hidden: true })
    .description('start a new Capacitor plugin')
    .action(
      wrapAction(async () => {
        const { newPluginCommand } = await import('./tasks/new-plugin');
        await newPluginCommand();
      }),
    );

  program.arguments('[command]').action(
    wrapAction(async cmd => {
      if (typeof cmd === 'undefined') {
        output.write(
          `\n  ${_e('⚡️', '--')}  ${c.strong(
            'Capacitor - Cross-Platform apps with JavaScript and the Web',
          )}  ${_e('⚡️', '--')}\n\n`,
        );
        program.outputHelp();
      } else {
        fatal(`Unknown command: ${c.input(cmd)}`);
      }
    }),
  );

  program.parse(process.argv);
}
