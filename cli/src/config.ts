import { pathExists, readJSON } from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, join, resolve } from 'path';

import c from './colors';
import { logFatal, resolveNode, runCommand } from './common';
import type {
  AndroidConfig,
  AppConfig,
  CLIConfig,
  Config,
  ExternalConfig,
  IOSConfig,
  WebConfig,
} from './definitions';
import { OS } from './definitions';
import { tryFn } from './util/fn';
import { requireTS } from './util/node';

const debug = Debug('capacitor:config');

export async function loadConfig(): Promise<Config> {
  const appRootDir = process.cwd();
  const cliRootDir = dirname(__dirname);
  const conf = await loadExtConfig(appRootDir);

  const appId = conf.extConfig.appId ?? '';
  const appName = conf.extConfig.appName ?? '';
  const webDir = conf.extConfig.webDir ?? 'www';
  const cli = await loadCLIConfig(cliRootDir);

  const config: Config = {
    android: await loadAndroidConfig(appRootDir, conf.extConfig, cli),
    ios: await loadIOSConfig(appRootDir, conf.extConfig, cli),
    web: await loadWebConfig(appRootDir, webDir),
    cli,
    app: {
      rootDir: appRootDir,
      appId,
      appName,
      webDir,
      webDirAbs: resolve(appRootDir, webDir),
      package: (await tryFn(readJSON, resolve(appRootDir, 'package.json'))) ?? {
        name: appName,
        version: '1.0.0',
      },
      ...conf,
      bundledWebRuntime: conf.extConfig.bundledWebRuntime ?? false,
    },
  };

  debug('config: %O', config);

  return config;
}

type ExtConfigPairs = Pick<
  AppConfig,
  'extConfigType' | 'extConfigName' | 'extConfigFilePath' | 'extConfig'
>;

async function loadExtConfigTS(
  rootDir: string,
  extConfigName: string,
  extConfigFilePath: string,
): Promise<ExtConfigPairs> {
  try {
    const tsPath = resolveNode(rootDir, 'typescript');

    if (!tsPath) {
      logFatal(
        'Could not find installation of TypeScript.\n' +
          `To use ${c.strong(
            extConfigName,
          )} files, you must install TypeScript in your project, e.g. w/ ${c.input(
            'npm install -D typescript',
          )}`,
      );
    }

    const ts = require(tsPath); // eslint-disable-line @typescript-eslint/no-var-requires

    return {
      extConfigType: 'ts',
      extConfigName,
      extConfigFilePath: extConfigFilePath,
      extConfig: requireTS(ts, extConfigFilePath) as any,
    };
  } catch (e) {
    logFatal(`Parsing ${c.strong(extConfigName)} failed.\n\n${e.stack ?? e}`);
  }
}

async function loadExtConfigJS(
  rootDir: string,
  extConfigName: string,
  extConfigFilePath: string,
): Promise<ExtConfigPairs> {
  try {
    return {
      extConfigType: 'js',
      extConfigName,
      extConfigFilePath: extConfigFilePath,
      extConfig: require(extConfigFilePath),
    };
  } catch (e) {
    logFatal(`Parsing ${c.strong(extConfigName)} failed.\n\n${e.stack ?? e}`);
  }
}

async function loadExtConfig(rootDir: string): Promise<ExtConfigPairs> {
  const extConfigNameTS = 'capacitor.config.ts';
  const extConfigFilePathTS = resolve(rootDir, extConfigNameTS);

  if (await pathExists(extConfigFilePathTS)) {
    return loadExtConfigTS(rootDir, extConfigNameTS, extConfigFilePathTS);
  }

  const extConfigNameJS = 'capacitor.config.js';
  const extConfigFilePathJS = resolve(rootDir, extConfigNameJS);

  if (await pathExists(extConfigFilePathJS)) {
    return loadExtConfigJS(rootDir, extConfigNameJS, extConfigFilePathJS);
  }

  const extConfigName = 'capacitor.config.json';
  const extConfigFilePath = resolve(rootDir, extConfigName);

  return {
    extConfigType: 'json',
    extConfigName,
    extConfigFilePath: extConfigFilePath,
    extConfig: (await tryFn(readJSON, extConfigFilePath)) ?? {},
  };
}

async function loadCLIConfig(rootDir: string): Promise<CLIConfig> {
  const assetsName = 'assets';

  return {
    rootDir,
    assetsName,
    assetsDir: join(rootDir, assetsName),
    package: await readJSON(resolve(rootDir, 'package.json')),
    os: determineOS(process.platform),
  };
}

async function loadAndroidConfig(
  rootDir: string,
  extConfig: ExternalConfig,
  cliConfig: CLIConfig,
): Promise<AndroidConfig> {
  const name = 'android';
  const platformDir = extConfig.android?.path ?? 'android';
  const platformDirAbs = resolve(rootDir, platformDir);
  const webDir = 'app/src/main/assets/public';
  const resDir = 'app/src/main/res';
  const buildOutputDir = 'app/build/outputs/apk/debug';

  const templateName = 'android-template';
  const pluginsFolderName = 'capacitor-cordova-android-plugins';
  const studioPath = await determineAndroidStudioPath(cliConfig.os);

  return {
    name,
    minVersion: '21',
    studioPath,
    platformDir,
    platformDirAbs,
    webDir,
    webDirAbs: resolve(platformDir, webDir),
    resDir,
    resDirAbs: resolve(platformDir, resDir),
    buildOutputDir,
    buildOutputDirAbs: resolve(platformDir, buildOutputDir),
    assets: {
      templateName,
      pluginsFolderName,
      templateDir: resolve(cliConfig.assetsDir, templateName),
      pluginsDir: resolve(cliConfig.assetsDir, pluginsFolderName),
    },
  };
}

async function loadIOSConfig(
  rootDir: string,
  extConfig: ExternalConfig,
  cliConfig: CLIConfig,
): Promise<IOSConfig> {
  const name = 'ios';
  const podPath = determineCocoapodPath();
  const platformDir = extConfig.ios?.path ?? 'ios';
  const platformDirAbs = resolve(rootDir, platformDir);
  const webDir = 'public';
  const nativeProjectName = 'App';
  const templateName = 'ios-template';
  const pluginsFolderName = 'capacitor-cordova-ios-plugins';

  return {
    name,
    minVersion: '11.0',
    cordovaSwiftVersion: '5.1',
    platformDir,
    platformDirAbs,
    webDir,
    webDirAbs: resolve(platformDir, nativeProjectName, webDir),
    nativeProjectName,
    assets: {
      templateName,
      pluginsFolderName,
      templateDir: resolve(cliConfig.assetsDir, templateName),
      pluginsDir: resolve(cliConfig.assetsDir, pluginsFolderName),
    },
    podPath,
  };
}

async function loadWebConfig(
  rootDir: string,
  webDir: string,
): Promise<WebConfig> {
  const platformDir = webDir;
  const platformDirAbs = resolve(rootDir, platformDir);

  return {
    name: 'web',
    platformDir,
    platformDirAbs,
  };
}

function determineOS(os: NodeJS.Platform): OS {
  switch (os) {
    case 'darwin':
      return OS.Mac;
    case 'win32':
      return OS.Windows;
    case 'linux':
      return OS.Linux;
  }

  return OS.Unknown;
}

async function determineAndroidStudioPath(os: OS): Promise<string> {
  if (process.env.STUDIO_PATH) {
    return process.env.STUDIO_PATH;
  }

  switch (os) {
    case OS.Mac:
      return '/Applications/Android Studio.app';
    case OS.Windows: {
      let p = 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe';

      try {
        if (!(await pathExists(p))) {
          let commandResult = await runCommand('REG', [
            'QUERY',
            'HKEY_LOCAL_MACHINE\\SOFTWARE\\Android Studio',
            '/v',
            'Path',
          ]);
          commandResult = commandResult.replace(/(\r\n|\n|\r)/gm, '');
          const i = commandResult.indexOf('REG_SZ');
          if (i > 0) {
            p = commandResult.substring(i + 6).trim() + '\\bin\\studio64.exe';
          }
        }
      } catch (e) {
        debug(`Error checking registry for Android Studio path: %O`, e);
        break;
      }

      return p;
    }
    case OS.Linux:
      return '/usr/local/android-studio/bin/studio.sh';
  }

  return '';
}

function determineCocoapodPath(): string {
  if (process.env.CAPACITOR_COCOAPODS_PATH) {
    return process.env.CAPACITOR_COCOAPODS_PATH;
  }

  return 'pod';
}
