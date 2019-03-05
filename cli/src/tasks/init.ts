import { Config } from '../config';
import { OS } from '../definitions';
import { addCommand } from '../tasks/add';
import {
  check,
  checkAppId,
  checkAppName,
  getAppId,
  getName,
  getOrCreateConfig,
  log,
  logFatal,
  mergeConfig,
  printNextSteps,
  runTask
} from '../common';
import { emoji as _e } from '../util/emoji';

const chalk = require('chalk');

export async function initCommand(config: Config, name: string, id: string) {
  try {
    // Get app name
    const appName = await getName(config, name);
    // Get app identifier
    const appId = await getAppId(config, id);

    await check(
      config,
      [
        (config) => checkAppName(config, appName),
        (config) => checkAppId(config, appId)
      ]
    );

    await runTask(`Initializing Capacitor project in ${chalk.blue(config.app.rootDir)}`, async () => {
      config.app.appId = appId;
      config.app.appName = appName;

      // Get or create our config
      await getOrCreateConfig(config);
      await mergeConfig(config, {
        appId,
        appName
      });
    });

    await printNextSteps(config, "");
  } catch (e) {
    log('Usage: npx cap init appName appId\n');
    log('Example: npx cap init "My App" "com.example.myapp"\n');
    logFatal(e);
  }
}