import {
  pathExists,
  readFile,
  readJSON,
  writeFile,
  writeJSON,
} from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, extname, join, relative, resolve } from 'path';

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
import { fatal, isFatal } from './errors';
import { logger } from './log';
import { tryFn } from './util/fn';
import { formatJSObject } from './util/js';
import { findNXMonorepoRoot, isNXMonorepo } from './util/monorepotools';
import { requireTS, resolveNode } from './util/node';
import { lazy } from './util/promise';
import { getCommandOutput } from './util/subprocess';

const debug = Debug('capacitor:config');

export const CONFIG_FILE_NAME_TS = 'capacitor.config.ts';
export const CONFIG_FILE_NAME_JS = 'capacitor.config.js';
export const CONFIG_FILE_NAME_JSON = 'capacitor.config.json';

export async function loadConfig(): Promise<Config> {
  const appRootDir = process.cwd();
  const cliRootDir = dirname(__dirname);
  const conf = await loadExtConfig(appRootDir);

  const depsForNx = await (async (): Promise<
    { devDependencies: any; dependencies: any } | object
  > => {
    if (isNXMonorepo(appRootDir)) {
      const rootOfNXMonorepo = findNXMonorepoRoot(appRootDir);
      const pkgJSONOfMonorepoRoot: any = await tryFn(
        readJSON,
        resolve(rootOfNXMonorepo, 'package.json'),
      );
      const devDependencies = pkgJSONOfMonorepoRoot?.devDependencies ?? {};
      const dependencies = pkgJSONOfMonorepoRoot?.dependencies ?? {};
      return {
        devDependencies,
        dependencies,
      };
    }
    return {};
  })();

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
        ...depsForNx,
      },
      ...conf,
    },
  };

  debug('config: %O', config);

  return config;
}

export async function writeConfig(
  extConfig: ExternalConfig,
  extConfigFilePath: string,
): Promise<void> {
  switch (extname(extConfigFilePath)) {
    case '.json': {
      await writeJSON(extConfigFilePath, extConfig, { spaces: 2 });
      break;
    }
    case '.ts': {
      await writeFile(extConfigFilePath, formatConfigTS(extConfig));
      break;
    }
  }
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
      fatal(
        'Could not find installation of TypeScript.\n' +
          `To use ${c.strong(
            extConfigName,
          )} files, you must install TypeScript in your project, e.g. w/ ${c.input(
            'npm install -D typescript',
          )}`,
      );
    }

    const ts = require(tsPath); // eslint-disable-line @typescript-eslint/no-var-requires
    const extConfigObject = requireTS(ts, extConfigFilePath) as any;
    const extConfig = extConfigObject.default ?? extConfigObject;

    return {
      extConfigType: 'ts',
      extConfigName,
      extConfigFilePath: extConfigFilePath,
      extConfig,
    };
  } catch (e: any) {
    if (!isFatal(e)) {
      fatal(`Parsing ${c.strong(extConfigName)} failed.\n\n${e.stack ?? e}`);
    }

    throw e;
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
  } catch (e: any) {
    fatal(`Parsing ${c.strong(extConfigName)} failed.\n\n${e.stack ?? e}`);
  }
}

async function loadExtConfig(rootDir: string): Promise<ExtConfigPairs> {
  const extConfigFilePathTS = resolve(rootDir, CONFIG_FILE_NAME_TS);

  if (await pathExists(extConfigFilePathTS)) {
    return loadExtConfigTS(rootDir, CONFIG_FILE_NAME_TS, extConfigFilePathTS);
  }

  const extConfigFilePathJS = resolve(rootDir, CONFIG_FILE_NAME_JS);

  if (await pathExists(extConfigFilePathJS)) {
    return loadExtConfigJS(rootDir, CONFIG_FILE_NAME_JS, extConfigFilePathJS);
  }

  const extConfigFilePath = resolve(rootDir, CONFIG_FILE_NAME_JSON);

  return {
    extConfigType: 'json',
    extConfigName: CONFIG_FILE_NAME_JSON,
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
  let apkPath = `${appDir}/build/outputs/apk/`;
  let flavorPrefix = '';
  const flavor = extConfig.android?.flavor || '';
  if (extConfig.android?.flavor) {
    apkPath = `${apkPath}/${extConfig.android?.flavor}`;
    flavorPrefix = `-${extConfig.android?.flavor}`;
  }
  const apkName = `app${flavorPrefix}-debug.apk`;
  const buildOutputDir = `${apkPath}/debug`;
  const cordovaPluginsDir = 'capacitor-cordova-android-plugins';
  const studioPath = lazy(() => determineAndroidStudioPath(cliConfig.os));
  const buildOptions = {
    keystorePath: extConfig.android?.buildOptions?.keystorePath,
    keystorePassword: extConfig.android?.buildOptions?.keystorePassword,
    keystoreAlias: extConfig.android?.buildOptions?.keystoreAlias,
    keystoreAliasPassword:
      extConfig.android?.buildOptions?.keystoreAliasPassword,
    signingType: extConfig.android?.buildOptions?.signingType,
    releaseType: extConfig.android?.buildOptions?.releaseType,
  };

  return {
    name,
    minVersion: '22',
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
    apkName,
    buildOutputDir,
    buildOutputDirAbs: resolve(platformDirAbs, buildOutputDir),
    flavor,
    buildOptions,
  };
}

async function loadIOSConfig(
  rootDir: string,
  extConfig: ExternalConfig,
): Promise<IOSConfig> {
  const name = 'ios';
  const platformDir = extConfig.ios?.path ?? 'ios';
  const platformDirAbs = resolve(rootDir, platformDir);
  const scheme = extConfig.ios?.scheme ?? 'App';
  const nativeProjectDir = 'App';
  const nativeProjectDirAbs = resolve(platformDirAbs, nativeProjectDir);
  const nativeTargetDir = `${nativeProjectDir}/App`;
  const nativeTargetDirAbs = resolve(platformDirAbs, nativeTargetDir);
  const nativeXcodeProjDir = `${nativeProjectDir}/App.xcodeproj`;
  const nativeXcodeProjDirAbs = resolve(platformDirAbs, nativeXcodeProjDir);
  const nativeXcodeWorkspaceDirAbs = lazy(() =>
    determineXcodeWorkspaceDirAbs(nativeProjectDirAbs),
  );
  const podPath = lazy(() =>
    determineGemfileOrCocoapodPath(
      rootDir,
      platformDirAbs,
      nativeProjectDirAbs,
    ),
  );
  const webDirAbs = lazy(() =>
    determineIOSWebDirAbs(
      nativeProjectDirAbs,
      nativeTargetDirAbs,
      nativeXcodeProjDirAbs,
    ),
  );
  const cordovaPluginsDir = 'capacitor-cordova-ios-plugins';

  return {
    name,
    minVersion: '13.0',
    platformDir,
    platformDirAbs,
    scheme,
    cordovaPluginsDir,
    cordovaPluginsDirAbs: resolve(platformDirAbs, cordovaPluginsDir),
    nativeProjectDir,
    nativeProjectDirAbs,
    nativeTargetDir,
    nativeTargetDirAbs,
    nativeXcodeProjDir,
    nativeXcodeProjDirAbs,
    nativeXcodeWorkspaceDir: lazy(async () =>
      relative(platformDirAbs, await nativeXcodeWorkspaceDirAbs),
    ),
    nativeXcodeWorkspaceDirAbs,
    webDir: lazy(async () => relative(platformDirAbs, await webDirAbs)),
    webDirAbs,
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

async function determineXcodeWorkspaceDirAbs(
  nativeProjectDirAbs: string,
): Promise<string> {
  return resolve(nativeProjectDirAbs, 'App.xcworkspace');
}

async function determineIOSWebDirAbs(
  nativeProjectDirAbs: string,
  nativeTargetDirAbs: string,
  nativeXcodeProjDirAbs: string,
): Promise<string> {
  const re = /path\s=\spublic[\s\S]+?sourceTree\s=\s([^;]+)/;
  const pbxprojPath = resolve(nativeXcodeProjDirAbs, 'project.pbxproj');
  try {
    const pbxproj = await readFile(pbxprojPath, { encoding: 'utf8' });

    const m = pbxproj.match(re);

    if (m && m[1] === 'SOURCE_ROOT') {
      logger.warn(
        `Using the iOS project root for the ${c.strong(
          'public',
        )} directory is deprecated.\n` +
          `Please follow the Upgrade Guide to move ${c.strong(
            'public',
          )} inside the iOS target directory: ${c.strong(
            'https://capacitorjs.com/docs/updating/3-0#move-public-into-the-ios-target-directory',
          )}`,
      );

      return resolve(nativeProjectDirAbs, 'public');
    }
  } catch (e) {
    // ignore
  }

  return resolve(nativeTargetDirAbs, 'public');
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

async function determineGemfileOrCocoapodPath(
  rootDir: string,
  platformDir: any,
  nativeProjectDirAbs: string,
): Promise<string> {
  if (process.env.CAPACITOR_COCOAPODS_PATH) {
    return process.env.CAPACITOR_COCOAPODS_PATH;
  }

  let gemfilePath = '';
  if (await pathExists(resolve(rootDir, 'Gemfile'))) {
    gemfilePath = resolve(rootDir, 'Gemfile');
  } else if (await pathExists(resolve(platformDir, 'Gemfile'))) {
    gemfilePath = resolve(platformDir, 'Gemfile');
  } else if (await pathExists(resolve(nativeProjectDirAbs, 'Gemfile'))) {
    gemfilePath = resolve(nativeProjectDirAbs, 'Gemfile');
  }

  const appSpecificGemfileExists = gemfilePath != '';

  // Multi-app projects might share a single global 'Gemfile' at the Git repository root directory.
  if (!appSpecificGemfileExists) {
    try {
      const output = await getCommandOutput(
        'git',
        ['rev-parse', '--show-toplevel'],
        { cwd: rootDir },
      );
      if (output != null) {
        gemfilePath = resolve(output, 'Gemfile');
      }
    } catch (e: any) {
      // Nothing
    }
  }

  try {
    const gemfileText = (await readFile(gemfilePath)).toString();
    if (!gemfileText) {
      return 'pod';
    }
    const cocoapodsInGemfile = new RegExp(/gem\s+['"]cocoapods/).test(
      gemfileText,
    );

    if (cocoapodsInGemfile) {
      return 'bundle exec pod';
    } else {
      return 'pod';
    }
  } catch {
    return 'pod';
  }
}

function formatConfigTS(extConfig: ExternalConfig): string {
  // TODO: <reference> tags
  return `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = ${formatJSObject(extConfig)};

export default config;\n`;
}

export function checkExternalConfig(config: ExtConfigPairs): void {
  if (typeof config.extConfig.bundledWebRuntime !== 'undefined') {
    let actionMessage = `Can be safely deleted.`;
    if (config.extConfig.bundledWebRuntime === true) {
      actionMessage = `Please, use a bundler to bundle Capacitor and its plugins.`;
    }
    logger.warn(
      `The ${c.strong(
        'bundledWebRuntime',
      )} configuration option has been deprecated. ${actionMessage}`,
    );
  }
}
