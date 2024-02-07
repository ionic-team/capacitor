import { Option, program } from 'commander';
import { resolve } from 'path';

import c from './colors';
import { checkExternalConfig, loadConfig } from './config';
import type { Config } from './definitions';
import { fatal, isFatal } from './errors';
import { receive } from './ipc';
import { logger, output } from './log';
import { telemetryAction } from './telemetry';
import { wrapAction } from './util/cli';
import { emoji as _e } from './util/emoji';

type Writable<T> = T extends object
  ? { -readonly [K in keyof T]: Writable<T[K]> }
  : T;

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
    .option('--flavor <flavorToBuild>', 'Android Flavor to build')
    .option('--keystorepath <keystorePath>', 'Path to the keystore')
    .option('--keystorepass <keystorePass>', 'Password to the keystore')
    .option('--keystorealias <keystoreAlias>', 'Key Alias in the keystore')
    .option('--configuration <name>', 'Configuration name of the iOS Scheme')
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
    .addOption(
      new Option(
        '--signing-type <signingtype>',
        'Program used to sign apps (default: jarsigner)',
      ).choices(['apksigner', 'jarsigner']),
    )
    .action(
      wrapAction(
        telemetryAction(
          config,
          async (
            platform,
            {
              scheme,
              flavor,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
              signingType,
              configuration,
            },
          ) => {
            const { buildCommand } = await import('./tasks/build');
            await buildCommand(config, platform, {
              scheme,
              flavor,
              keystorepath,
              keystorepass,
              keystorealias,
              keystorealiaspass,
              androidreleasetype,
              signingtype: signingType,
              configuration,
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
    .option(
      '--flavor <flavorName>',
      'set the flavor of the Android project (flavor dimensions not yet supported)',
    )
    .option('--list', 'list targets, then quit')
    // TODO: remove once --json is a hidden option (https://github.com/tj/commander.js/issues/1106)
    .allowUnknownOption(true)
    .option('--target <id>', 'use a specific target')
    .option('--no-sync', `do not run ${c.input('sync')}`)
    .option(
      '--forwardPorts <port:port>',
      'Automatically run "adb reverse" for better live-reloading support',
    )
    .option('-l, --live-reload', 'Enable Live Reload')
    .option('--host <host>', 'Host used for live reload')
    .option('--port <port>', 'Port used for live reload')
    .option('--configuration <name>', 'Configuration name of the iOS Scheme')
    .action(
      wrapAction(
        telemetryAction(
          config,
          async (
            platform,
            {
              scheme,
              flavor,
              list,
              target,
              sync,
              forwardPorts,
              liveReload,
              host,
              port,
              configuration,
            },
          ) => {
            const { runCommand } = await import('./tasks/run');
            await runCommand(config, platform, {
              scheme,
              flavor,
              list,
              target,
              sync,
              forwardPorts,
              liveReload,
              host,
              port,
              configuration,
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
    .option(
      '--packagemanager <packageManager>',
      'The package manager to use for dependency installs (SPM, Cocoapods)',
    )
    .action(
      wrapAction(
        telemetryAction(config, async (platform, { packagemanager }) => {
          checkExternalConfig(config.app);
          const { addCommand } = await import('./tasks/add');

          const configWritable: Writable<Config> = config as Writable<Config>;
          if (packagemanager === 'SPM') {
            configWritable.cli.assets.ios.platformTemplateArchive =
              'ios-spm-template.tar.gz';
            configWritable.cli.assets.ios.platformTemplateArchiveAbs = resolve(
              configWritable.cli.assetsDirAbs,
              configWritable.cli.assets.ios.platformTemplateArchive,
            );
          }

          await addCommand(configWritable as Config, platform);
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
    .option('--noprompt', 'do not prompt for confirmation')
    .option(
      '--packagemanager <packageManager>',
      'The package manager to use for dependency installs (npm, pnpm, yarn)',
    )
    .description(
      'Migrate your current Capacitor app to the latest major version of Capacitor.',
    )
    .action(
      wrapAction(async ({ noprompt, packagemanager }) => {
        const { migrateCommand } = await import('./tasks/migrate');
        await migrateCommand(config, noprompt, packagemanager);
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
