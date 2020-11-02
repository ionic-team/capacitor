import { pathExists, readJSON } from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, join, resolve } from 'path';

import { runCommand } from './common';
import type {
  Config,
  ExternalConfig,
  CLIConfig,
  AndroidConfig,
  IOSConfig,
  PackageJson,
  WebConfig,
} from './definitions';
import { OS } from './definitions';

const debug = Debug('capacitor:config');

export const EXTERNAL_CONFIG_FILE = 'capacitor.config.json';

export async function loadConfig(): Promise<Config> {
  const appRootDir = process.cwd();
  const cliRootDir = dirname(__dirname);
  const extConfig = await loadExternalConfig(
    resolve(appRootDir, EXTERNAL_CONFIG_FILE),
  );

  const appId = extConfig.appId ?? '';
  const appName = extConfig.appName ?? '';
  const webDir = extConfig.webDir ?? 'www';
  const cli = await loadCLIConfig(cliRootDir);

  const config = {
    android: await loadAndroidConfig(appRootDir, extConfig, cli),
    ios: await loadIOSConfig(appRootDir, extConfig, cli),
    web: await loadWebConfig(appRootDir, webDir),
    cli,
    app: {
      rootDir: appRootDir,
      appId,
      appName,
      webDir,
      webDirAbs: resolve(appRootDir, webDir),
      package: (await readPackageJSON(resolve(appRootDir, 'package.json'))) ?? {
        name: appName,
        version: '1.0.0',
      },
      extConfigName: EXTERNAL_CONFIG_FILE,
      extConfigFilePath: resolve(appRootDir, EXTERNAL_CONFIG_FILE),
      extConfig,
      bundledWebRuntime: extConfig.bundledWebRuntime ?? false,
    },
  };

  debug('config: %O', config);

  return config;
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

async function loadExternalConfig(p: string): Promise<ExternalConfig> {
  try {
    return await readJSON(p);
  } catch (e) {
    return {};
  }
}

async function readPackageJSON(p: string): Promise<PackageJson | null> {
  try {
    return await readJSON(p);
  } catch (e) {
    return null;
  }
}
