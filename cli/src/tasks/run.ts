import { columnar } from '@ionic/utils-terminal';

import { runAndroid } from '../android/run';
import c from '../colors';
import {
  isValidPlatform,
  resolvePlatform,
  runPlatformHook,
  selectPlatforms,
  promptForPlatform,
  getPlatformTargetName,
} from '../common';
import { getCordovaPlugins, writeCordovaAndroidManifest } from '../cordova';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { runIOS } from '../ios/run';
import { logger, output } from '../log';
import { CapLiveReloadHelper } from '../util/livereload';
import { getPlatformTargets } from '../util/native-run';

import { sync } from './sync';

export interface RunCommandOptions {
  scheme?: string;
  flavor?: string;
  list?: boolean;
  json?: boolean;
  target?: string;
  sync?: boolean;
  forwardPorts?: string;
  liveReload?: boolean;
  host?: string;
  port?: string;
  configuration?: string;
}

export async function runCommand(
  config: Config,
  selectedPlatformName: string,
  options: RunCommandOptions,
): Promise<void> {
  options.host = options.host ?? CapLiveReloadHelper.getIpAddress() ?? 'localhost';
  options.port = options.port ?? '3000';
  if (selectedPlatformName && !(await isValidPlatform(selectedPlatformName))) {
    const platformDir = resolvePlatform(config, selectedPlatformName);
    if (platformDir) {
      await runPlatformHook(config, selectedPlatformName, platformDir, 'capacitor:run');
    } else {
      logger.error(`Platform ${c.input(selectedPlatformName)} not found.`);
    }
  } else {
    const platforms = await selectPlatforms(config, selectedPlatformName);
    let platformName: string;
    if (platforms.length === 1) {
      platformName = platforms[0];
    } else {
      platformName = await promptForPlatform(
        platforms.filter(createRunnablePlatformFilter(config)),
        `Please choose a platform to run:`,
      );
    }

    if (options.list) {
      const targets = await getPlatformTargets(platformName);
      const outputTargets = targets.map((t) => ({
        name: getPlatformTargetName(t),
        api: `${t.platform === 'ios' ? 'iOS' : 'API'} ${t.sdkVersion}`,
        id: t.id ?? '?',
      }));

      if (options.json) {
        process.stdout.write(`${JSON.stringify(outputTargets)}\n`);
      } else {
        const rows = outputTargets.map((t) => [t.name, t.api, t.id]);

        output.write(
          `${columnar(rows, {
            headers: ['Name', 'API', 'Target ID'],
            vsep: ' ',
          })}\n`,
        );
      }

      return;
    }

    try {
      if (options.sync) {
        await sync(config, platformName, false, true);
      }
      const cordovaPlugins = await getCordovaPlugins(config, platformName);
      if (options.liveReload) {
        await CapLiveReloadHelper.editCapConfigForLiveReload(config, platformName, options);
        if (platformName === config.android.name) {
          await await writeCordovaAndroidManifest(cordovaPlugins, config, platformName, true);
        }
      }
      await run(config, platformName, options);
      if (options.liveReload) {
        new Promise((resolve) => process.on('SIGINT', resolve))
          .then(async () => {
            await CapLiveReloadHelper.revertCapConfigForLiveReload();
            if (platformName === config.android.name) {
              await writeCordovaAndroidManifest(cordovaPlugins, config, platformName, false);
            }
          })
          .then(() => process.exit());
        logger.info(
          `App running with live reload listing for: http://${options.host}:${options.port}. Press Ctrl+C to quit.`,
        );
        await sleepForever();
      }
    } catch (e: any) {
      if (!isFatal(e)) {
        fatal(e.stack ?? e);
      }

      throw e;
    }
  }
}

export async function run(config: Config, platformName: string, options: RunCommandOptions): Promise<void> {
  if (platformName == config.ios.name) {
    await runIOS(config, options);
  } else if (platformName === config.android.name) {
    await runAndroid(config, options);
  } else if (platformName === config.web.name) {
    return;
  } else {
    throw `Platform ${platformName} is not valid.`;
  }
}

function createRunnablePlatformFilter(config: Config): (platform: string) => boolean {
  return (platform) => platform === config.ios.name || platform === config.android.name;
}

async function sleepForever(): Promise<never> {
  return new Promise<never>(() => {
    setInterval(() => {
      /* do nothing */
    }, 1000);
  });
}
