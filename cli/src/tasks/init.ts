import { Config } from '../config';
import {
  check,
  checkAppId,
  checkAppName,
  checkNpmClient,
  getAppId,
  getName,
  getNpmClient,
  getOrCreateConfig,
  log,
  logFatal,
  mergeConfig,
  printNextSteps,
  runTask,
} from '../common';
import { getCordovaPreferences } from '../cordova';
import { emoji as _e } from '../util/emoji';
import { checkInteractive } from '../util/term';

const chalk = require('chalk');

export async function initCommand(config: Config, name: string, id: string, webDir: string, client: string) {
  if (webDir === '') {
    webDir = 'www';
  }
  try {
    if (!checkInteractive(name, id)) {
      return;
    }
    // Get app name
    const appName = await getName(config, name);
    // Get app identifier
    const appId = await getAppId(config, id);
    // Get npm client
    const npmClient = await getNpmClient(config, client);

    await check(
      config,
      [
        (config) => checkAppName(config, appName),
        (config) => checkAppId(config, appId),
        (config) => checkNpmClient(config, npmClient)
      ]
    );

    const cordova = await getCordovaPreferences(config);

    await runTask(`Initializing Capacitor project in ${chalk.blue(config.app.rootDir)}`, async () => {
      config.app.appId = appId;
      config.app.appName = appName;
      config.app.webDir = webDir;
      config.cli.npmClient = npmClient;

      // Get or create our config
      await getOrCreateConfig(config);
      await mergeConfig(config, {
        appId,
        appName,
        webDir,
        npmClient,
        cordova
      });
    });

    await printNextSteps(config, '');
  } catch (e) {
    log('Usage: npx cap init appName appId\n');
    log('Example: npx cap init "My App" "com.example.myapp"\n');
    logFatal(e);
  }
}
