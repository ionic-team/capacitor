import c from '../colors';
import { Config } from '../config';
import {
  check,
  checkAppId,
  checkAppName,
  getAppId,
  getName,
  getOrCreateConfig,
  logFatal,
  mergeConfig,
  printNextSteps,
  runTask,
} from '../common';
import { getCordovaPreferences } from '../cordova';
import { emoji as _e } from '../util/emoji';
import { checkInteractive } from '../util/term';
import { output } from '../log';

export async function initCommand(
  config: Config,
  name: string,
  id: string,
  webDir: string,
) {
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

    await check(config, [
      config => checkAppName(config, appName),
      config => checkAppId(config, appId),
    ]);

    const cordova = await getCordovaPreferences(config);

    await runTask(
      `Initializing Capacitor project in ${c.input(config.app.rootDir)}`,
      async () => {
        config.app.appId = appId;
        config.app.appName = appName;
        config.app.webDir = webDir;

        // Get or create our config
        await getOrCreateConfig(config);
        await mergeConfig(config, {
          appId,
          appName,
          webDir,
          cordova,
        });
      },
    );

    await printNextSteps(config, '');
  } catch (e) {
    output.write(
      'Usage: npx cap init appName appId\n' +
        'Example: npx cap init "My App" "com.example.myapp"\n\n',
    );
    logFatal(e.stack ?? e);
  }
}
