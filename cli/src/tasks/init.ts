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
  runTask,
  logSuccess,
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
    const appName = await getName(config, name);
    const appId = await getAppId(config, id);

    await check(config, [
      config => checkAppName(config, appName),
      config => checkAppId(config, appId),
    ]);

    const cordova = await getCordovaPreferences(config);

    await runTask(
      `Creating ${c.strong('capacitor.config.json')} in ${c.input(
        config.app.rootDir,
      )}`,
      async () => {
        config.app.appId = appId;
        config.app.appName = appName;
        config.app.webDir = webDir;

        await getOrCreateConfig(config);
        await mergeConfig(config, {
          appId,
          appName,
          webDir,
          cordova,
        });
      },
    );

    printNextSteps();
  } catch (e) {
    output.write(
      'Usage: npx cap init appName appId\n' +
        'Example: npx cap init "My App" "com.example.myapp"\n\n',
    );
    logFatal(e.stack ?? e);
  }
}

function printNextSteps() {
  logSuccess(`${c.strong('capacitor.config.json')} created!`);
  output.write(
    `\nAdd platforms using ${c.input('npx cap add')}:\n` +
      `  ${c.input('npx cap add android')}\n` +
      `  ${c.input('npx cap add ios')}\n\n` +
      `Follow the Developer Workflow guide to get building:\n${c.strong(
        `https://capacitorjs.com/docs/basics/workflow`,
      )}\n`,
  );
}
