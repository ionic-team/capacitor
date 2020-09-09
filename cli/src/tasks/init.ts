import c from '../colors';
import { Config } from '../config';
import {
  check,
  checkAppId,
  checkAppName,
  getOrCreateConfig,
  logFatal,
  mergeConfig,
  runTask,
  logSuccess,
  logPrompt,
} from '../common';
import { getCordovaPreferences } from '../cordova';
import { emoji as _e } from '../util/emoji';
import { checkInteractive, isInteractive } from '../util/term';
import { logger, output } from '../log';
import prompts from 'prompts';

export async function initCommand(
  config: Config,
  name: string,
  id: string,
  webDirFromCLI = 'www',
) {
  try {
    if (!checkInteractive(name, id)) {
      return;
    }
    const appName = await getName(config, name);
    const appId = await getAppId(config, id);
    const webDir = isInteractive()
      ? await getWebDir(config, webDirFromCLI)
      : webDirFromCLI;

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

async function getName(config: Config, name: string) {
  if (!name) {
    const answers = await logPrompt(
      `${c.strong(`What is the name of your app?`)}\n` +
        `This should be a human-friendly app name, like what you'd see in the App Store.`,
      {
        type: 'text',
        name: 'name',
        message: `Name`,
        initial: config.app.appName
          ? config.app.appName
          : config.app.package && config.app.package.name
          ? config.app.package.name
          : 'App',
      },
    );
    return answers.name;
  }
  return name;
}

async function getAppId(config: Config, id: string) {
  if (!id) {
    const answers = await logPrompt(
      `${c.strong(`What should be the Package ID for your app?`)}\n` +
        `Package IDs (aka Bundle ID in iOS and Application ID in Android) are unique identifiers for apps. They must be in reverse domain name notation, generally representing a domain name that you or your company owns.`,
      {
        type: 'text',
        name: 'id',
        message: `Package ID`,
        initial: config.app.appId ? config.app.appId : 'com.example.app',
      },
    );
    return answers.id;
  }
  return id;
}

async function getWebDir(config: Config, webDir: string) {
  if (!webDir) {
    const answers = await logPrompt(
      `${c.strong(`What is the web asset directory for your app?`)}\n` +
        `This directory should contain the final ${c.strong(
          'index.html',
        )} of your app.`,
      {
        type: 'text',
        name: 'webDir',
        message: `Web asset directory`,
        initial: config.app.webDir ? config.app.webDir : 'www',
      },
    );
    return answers.webDir;
  }
  return webDir;
}
