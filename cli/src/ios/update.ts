import { pathExists, readFile, realpath, writeFile } from 'fs-extra';
import { basename, dirname, join, relative } from 'path';

import c from '../colors';
import { checkPlatformVersions, runTask } from '../common';
import { checkPluginDependencies, handleCordovaPluginsJS, logCordovaManualSteps, needsStaticPod } from '../cordova';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import { PluginType, getPlatformElement, getPluginType, getPlugins, printPlugins } from '../plugin';
import type { Plugin } from '../plugin';
import { copy as copyTask } from '../tasks/copy';
import {
  generateCordovaPodspecs,
  generateCordovaPackageFiles,
  copyPluginsNativeFiles,
  removePluginsNativeFiles,
  cordovaPodfileLines,
} from '../util/cordova-ios';
import { convertToUnixPath } from '../util/fs';
import { generateIOSPackageJSON } from '../util/iosplugin';
import { resolveNode } from '../util/node';
import { generatePackageFile, checkPluginsForPackageSwift } from '../util/spm';
import { runCommand, isInstalled } from '../util/subprocess';

import { getIOSPlugins } from './common';

const platform = 'ios';

export async function updateIOS(config: Config, deployment: boolean): Promise<void> {
  const plugins = await getPluginsTask(config);

  const capacitorPlugins = plugins.filter((p) => getPluginType(p, platform) === PluginType.Core);
  await updatePluginFiles(config, plugins, deployment);
  await checkPlatformVersions(config, platform);
  generateIOSPackageJSON(config, plugins);

  printPlugins(capacitorPlugins, 'ios');
}

async function updatePluginFiles(config: Config, plugins: Plugin[], deployment: boolean) {
  await removePluginsNativeFiles(config);
  const cordovaPlugins = plugins.filter((p) => getPluginType(p, platform) === PluginType.Cordova);

  const enableCordova = cordovaPlugins.length > 0;

  if (enableCordova) {
    await copyPluginsNativeFiles(config, cordovaPlugins);
  }

  if (!(await pathExists(await config.ios.webDirAbs))) {
    await copyTask(config, platform);
  }

  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
  await checkPluginDependencies(plugins, platform, config.app.extConfig.cordova?.failOnUninstalledPlugins);
  if ((await config.ios.packageManager) === 'SPM') {
    if (enableCordova) {
      await generateCordovaPackageFiles(cordovaPlugins, config);
    }

    const validSPMPackages = await checkPluginsForPackageSwift(config, plugins);

    await generatePackageFile(config, validSPMPackages.concat(cordovaPlugins));
  } else {
    if (enableCordova) {
      await generateCordovaPodspecs(cordovaPlugins, config);
    }

    await installCocoaPodsPlugins(config, plugins, deployment, enableCordova);

  }
  
  if (enableCordova) {
    await logCordovaManualSteps(cordovaPlugins, config, platform);
  }
}

export async function installCocoaPodsPlugins(
  config: Config,
  plugins: Plugin[],
  deployment: boolean,
  enableCordova: boolean,
): Promise<void> {
  await runTask(`Updating iOS native dependencies with ${c.input(`${await config.ios.podPath} install`)}`, () => {
    return updatePodfile(config, plugins, deployment, enableCordova);
  });
}

async function updatePodfile(
  config: Config,
  plugins: Plugin[],
  deployment: boolean,
  enableCordova: boolean,
): Promise<void> {
  const dependenciesContent = await generatePodFile(config, plugins, enableCordova);
  const relativeCapacitoriOSPath = await getRelativeCapacitoriOSPath(config);
  const podfilePath = join(config.ios.nativeProjectDirAbs, 'Podfile');
  let podfileContent = await readFile(podfilePath, { encoding: 'utf-8' });
  podfileContent = podfileContent.replace(/(def capacitor_pods)[\s\S]+?(\nend)/, `$1${dependenciesContent}$2`);
  podfileContent = podfileContent.replace(
    /(require_relative)[\s\S]+?(ios\/scripts\/pods_helpers')/,
    `require_relative '${relativeCapacitoriOSPath}/scripts/pods_helpers'`,
  );
  await writeFile(podfilePath, podfileContent, { encoding: 'utf-8' });

  const podPath = await config.ios.podPath;
  const useBundler = (await config.ios.packageManager) === 'bundler';
  if (useBundler) {
    await runCommand('bundle', ['exec', 'pod', 'install', ...(deployment ? ['--deployment'] : [])], {
      cwd: config.ios.nativeProjectDirAbs,
    });
  } else if (await isInstalled('pod')) {
    await runCommand(podPath, ['install', ...(deployment ? ['--deployment'] : [])], {
      cwd: config.ios.nativeProjectDirAbs,
    });
  } else {
    logger.warn('Skipping pod install because CocoaPods is not installed');
  }

  const isXcodebuildAvailable = await isInstalled('xcodebuild');
  if (isXcodebuildAvailable) {
    await runCommand('xcodebuild', ['-project', basename(`${config.ios.nativeXcodeProjDirAbs}`), 'clean'], {
      cwd: config.ios.nativeProjectDirAbs,
    });
  } else {
    logger.warn('Unable to find "xcodebuild". Skipping xcodebuild clean step...');
  }
}

async function getRelativeCapacitoriOSPath(config: Config) {
  const capacitoriOSPath = resolveNode(config.app.rootDir, '@capacitor/ios', 'package.json');

  if (!capacitoriOSPath) {
    fatal(
      `Unable to find ${c.strong('node_modules/@capacitor/ios')}.\n` +
        `Are you sure ${c.strong('@capacitor/ios')} is installed?`,
    );
  }

  return convertToUnixPath(relative(config.ios.nativeProjectDirAbs, await realpath(dirname(capacitoriOSPath))));
}

async function generatePodFile(config: Config, plugins: Plugin[], enableCordova: boolean): Promise<string> {
  const relativeCapacitoriOSPath = await getRelativeCapacitoriOSPath(config);

  const capacitorPlugins = plugins.filter((p) => getPluginType(p, platform) === PluginType.Core);
  const pods = await Promise.all(
    capacitorPlugins.map(async (p) => {
      if (!p.ios) {
        return '';
      }

      return `  pod '${p.ios.name}', :path => '${convertToUnixPath(
        relative(config.ios.nativeProjectDirAbs, await realpath(p.rootPath)),
      )}'\n`;
    }),
  );
  const cordovaPodlines = cordovaPodfileLines(config, plugins);
  pods.concat(cordovaPodlines);

  let podfileString = '\n';
  podfileString += `  pod 'Capacitor', :path => '${relativeCapacitoriOSPath}'\n`;

  if (enableCordova) {
    podfileString += `  pod 'CapacitorCordova', :path => '${relativeCapacitoriOSPath}'\n`;
  }

  podfileString += pods.join('').trimEnd();

  return podfileString;
}

async function getPluginsTask(config: Config) {
  return await runTask('Updating iOS plugins', async () => {
    const allPlugins = await getPlugins(config, 'ios');
    const iosPlugins = await getIOSPlugins(allPlugins);
    return iosPlugins;
  });
}
