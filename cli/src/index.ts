import { Option, program } from 'commander';

import c from './colors';
import { checkExternalConfig, loadConfig } from './config';
import type { Config } from './definitions';
import { fatal, isFatal } from './errors';
import { receive } from './ipc';
import { logger, output } from './log';
import { telemetryAction } from './telemetry';
import { wrapAction } from './util/cli';
import { emoji as _e } from './util/emoji';

process.on('unhandledRejection', error => {
  console.error(c.failure('[fatal]'), error);
});

process.on('message', receive);

export async function run(): Promise<void> {
  try {
    const config = await loadConfig();
    runProgram(config);
  } catch (e: any) {
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
      'Optional: if provided, pod install will use --deployment option',
    )
    .option(
      '--inline',
      'Optional: if true, all source maps will be inlined for easier debugging on mobile devices',
      false,
    )
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { deployment, inline }) => {
          checkExternalConfig(config.app);
          const { syncCommand } = await import('./tasks/sync');
          await syncCommand(config, platform, deployment, inline);
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
      'Optional: if provided, pod install will use --deployment option',
    )
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { deployment }) => {
          checkExternalConfig(config.app);
          const { updateCommand } = await import('./tasks/update');
          await updateCommand(config, platform, deployment);
        }),
      ),
    );

  program
    .command('copy [platform]')
    .description('copies the web app build into the native app')
    .option(
      '--inline',
      'Optional: if true, all source maps will be inlined for easier debugging on mobile devices',
      false,
    )
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { inline }) => {
          checkExternalConfig(config.app);
          const { copyCommand } = await import('./tasks/copy');
          await copyCommand(config, platform, inline);
        }),
      ),
    );

  program
    .command('build <platform>')
    .description('builds the release version of the selected platform')
    .option('--scheme <schemeToBuild>', 'iOS Scheme to build')
    .option('--keystorepath <keystorePath>', 'Path to the keystore')
    .option('--keystorepass <keystorePass>', 'Password to the keystore')
    .option('--keystorealias <keystoreAlias>', 'Key Alias in the keystore')
    .option(
      '--keystorealiaspass <keystoreAliasPass>',
      'Password for the Key Alias',
    )
    .addOption(
      new Option(
        '--androidreleasetype <androidreleasetype>',
        'Android release type; APK or AAB',
      ).choices(['AAB', 'APK']),
    )
    .action(
      wrapAction(
        telemetryAction(
          config,
          async (
            platform,
            {
              scheme,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
            },
          ) => {
            const { buildCommand } = await import('./tasks/build');
            await buildCommand(config, platform, {
              scheme,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
            });
          },
        ),
      ),
    );
  program
    .command(`run [platform]`)
    .description(
      `runs ${c.input('sync')}, then builds and deploys the native app`,
    )
    .option('--scheme <schemeName>', 'set the scheme of the iOS project')
    .option('--flavor <flavorName>', 'set the flavor of the Android project')
    .option('--list', 'list targets, then quit')
    // TODO: remove once --json is a hidden option (https://github.com/tj/commander.js/issues/1106)
    .allowUnknownOption(true)
    .option('--target <id>', 'use a specific target')
    .option('--no-sync', `do not run ${c.input('sync')}`)
    .option(
      '--forwardPorts <port:port>',
      'Automatically run "adb reverse" for better live-reloading support',
    )
    .action(
      wrapAction(
        telemetryAction(
          config,
          async (
            platform,
            { scheme, flavor, list, target, sync, forwardPorts },
          ) => {
            const { runCommand } = await import('./tasks/run');
            await runCommand(config, platform, {
              scheme,
              flavor,
              list,
              target,
              sync,
              forwardPorts,
            });
          },
        ),
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
          checkExternalConfig(config.app);
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
          checkExternalConfig(config.app);
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
          checkExternalConfig(config.app);
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

  program
    .command('migrate')
    .description(
      'Migrate your current Capacitor app to the latest major version of Capacitor.',
    )
    .action(
      wrapAction(async () => {
        const { migrateCommand } = await import('./tasks/migrate');
        await migrateCommand(config);
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
