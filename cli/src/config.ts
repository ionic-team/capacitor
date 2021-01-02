import { pathExists, readJSON } from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, join, resolve } from 'path';

import c from './colors';
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
import { logFatal } from './log';
import { tryFn } from './util/fn';
import { resolveNode, requireTS } from './util/node';
import { lazy } from './util/promise';

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
    ios: await loadIOSConfig(appRootDir, conf.extConfig),
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
  const assetsDir = 'assets';
  const assetsDirAbs = join(rootDir, assetsDir);
  const iosPlatformTemplateArchive = 'ios-template.tar.gz';
  const iosCordovaPluginsTemplateArchive =
    'capacitor-cordova-ios-plugins.tar.gz';
  const androidPlatformTemplateArchive = 'android-template.tar.gz';
  const androidCordovaPluginsTemplateArchive =
    'capacitor-cordova-android-plugins.tar.gz';

  return {
    rootDir,
    assetsDir,
    assetsDirAbs,
    assets: {
      ios: {
        platformTemplateArchive: iosPlatformTemplateArchive,
        platformTemplateArchiveAbs: resolve(
          assetsDirAbs,
          iosPlatformTemplateArchive,
        ),
        cordovaPluginsTemplateArchive: iosCordovaPluginsTemplateArchive,
        cordovaPluginsTemplateArchiveAbs: resolve(
          assetsDirAbs,
          iosCordovaPluginsTemplateArchive,
        ),
      },
      android: {
        platformTemplateArchive: androidPlatformTemplateArchive,
        platformTemplateArchiveAbs: resolve(
          assetsDirAbs,
          androidPlatformTemplateArchive,
        ),
        cordovaPluginsTemplateArchive: androidCordovaPluginsTemplateArchive,
        cordovaPluginsTemplateArchiveAbs: resolve(
          assetsDirAbs,
          androidCordovaPluginsTemplateArchive,
        ),
      },
    },
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
  const appDir = 'app';
  const srcDir = `${appDir}/src`;
  const srcMainDir = `${srcDir}/main`;
  const assetsDir = `${srcMainDir}/assets`;
  const webDir = `${assetsDir}/public`;
  const resDir = `${srcMainDir}/res`;
  const buildOutputDir = `${appDir}/build/outputs/apk/debug`;
  const cordovaPluginsDir = 'capacitor-cordova-android-plugins';
  const studioPath = lazy(() => determineAndroidStudioPath(cliConfig.os));

  return {
    name,
    minVersion: '21',
    studioPath,
    platformDir,
    platformDirAbs,
    cordovaPluginsDir,
    cordovaPluginsDirAbs: resolve(platformDirAbs, cordovaPluginsDir),
    appDir,
    appDirAbs: resolve(platformDirAbs, appDir),
    srcDir,
    srcDirAbs: resolve(platformDirAbs, srcDir),
    srcMainDir,
    srcMainDirAbs: resolve(platformDirAbs, srcMainDir),
    assetsDir,
    assetsDirAbs: resolve(platformDirAbs, assetsDir),
    webDir,
    webDirAbs: resolve(platformDirAbs, webDir),
    resDir,
    resDirAbs: resolve(platformDirAbs, resDir),
    buildOutputDir,
    buildOutputDirAbs: resolve(platformDirAbs, buildOutputDir),
  };
}

async function loadIOSConfig(
  rootDir: string,
  extConfig: ExternalConfig,
): Promise<IOSConfig> {
  const name = 'ios';
  const podPath = determineCocoapodPath();
  const platformDir = extConfig.ios?.path ?? 'ios';
  const platformDirAbs = resolve(rootDir, platformDir);
  const nativeProjectDir = 'App';
  const nativeTargetDir = `${nativeProjectDir}/App`;
  const webDir = `${nativeProjectDir}/public`;
  const cordovaPluginsDir = 'capacitor-cordova-ios-plugins';

  return {
    name,
    minVersion: '12.0',
    platformDir,
    platformDirAbs,
    cordovaPluginsDir,
    cordovaPluginsDirAbs: resolve(platformDirAbs, cordovaPluginsDir),
    nativeProjectDir,
    nativeProjectDirAbs: resolve(platformDirAbs, nativeProjectDir),
    nativeTargetDir,
    nativeTargetDirAbs: resolve(platformDirAbs, nativeTargetDir),
    webDir,
    webDirAbs: resolve(platformDirAbs, webDir),
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
  if (process.env.CAPACITOR_ANDROID_STUDIO_PATH) {
    return process.env.CAPACITOR_ANDROID_STUDIO_PATH;
  }

  switch (os) {
    case OS.Mac:
      return '/Applications/Android Studio.app';
    case OS.Windows: {
      const { runCommand } = await import('./util/subprocess');

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
