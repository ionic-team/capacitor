import { LOGGER_LEVELS } from '@ionic/cli-framework-output'; // Ugh, I hate this, lets yank it
import { pathExists, existsSync, writeFileSync, ensureDir, remove, move } from 'fs-extra';
import { join, relative, resolve } from 'path';
import { extract } from 'tar';

import { getCapacitorPackageVersion } from '../common';
import type { Config } from '../definitions';
import { getIOSPlugins, getMajoriOSVersion } from '../ios/common';
import { logger, logOptSuffix } from '../log';
import type { Plugin } from '../plugin';
import { getPlugins, printPlugins } from '../plugin';
import { runCommand, isInstalled } from '../util/subprocess';

export interface SwiftPlugin {
  name: string;
  path: string;
}
export interface MigrateSPMInteractiveOptions {
  dryRun: boolean;
}

export async function checkPackageManager(config: Config): Promise<'Cocoapods' | 'SPM'> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  if (existsSync(resolve(iosDirectory, 'CapApp-SPM'))) {
    return 'SPM';
  }

  return 'Cocoapods';
}

export async function findPackageSwiftFile(config: Config): Promise<string> {
  const packageDirectory = resolve(config.ios.nativeProjectDirAbs, 'CapApp-SPM');
  return resolve(packageDirectory, 'Package.swift');
}

export async function generatePackageFile(config: Config, plugins: Plugin[]): Promise<void> {
  const packageSwiftFile = await findPackageSwiftFile(config);
  try {
    logger.info('Writing Package.swift');
    const textToWrite = await generatePackageText(config, plugins);
    writeFileSync(packageSwiftFile, textToWrite);
  } catch (err) {
    logger.error(`Unable to write to ${packageSwiftFile}. Verify it is not already open. \n Error: ${err}`);
  }
}

export async function processIosPackages(config: Config): Promise<Plugin[]> {
  const plugins = await getPlugins(config, 'ios');
  printPlugins(plugins, 'ios', 'capacitor');

  const packageSwiftPluginList = await iosPluginsWithPackageSwift(plugins);
  printPlugins(packageSwiftPluginList, 'ios', 'packagespm');

  if (plugins.length == packageSwiftPluginList.length) {
    logger.info('Number of plugins in lists match'); // TODO: Word this better
  } else {
    logger.warn('Some installed packages my not be compatable with SPM');
  }

  return packageSwiftPluginList;
}

export async function iosPluginsWithPackageSwift(plugins: Plugin[]): Promise<Plugin[]> {
  const packageList = await pluginsWithPackageSwift(plugins);
  const iosPackageList = await getIOSPlugins(packageList);

  return iosPackageList;
}

export async function extractSPMPackageDirectory(config: Config, options: MigrateSPMInteractiveOptions): Promise<void> {
  const spmDirectory = join(config.ios.nativeProjectDirAbs, 'CapApp-SPM');
  const spmTemplate = join(config.cli.assetsDirAbs, 'ios-spm-migrate-template.tar.gz');

  logOptSuffix('Extracting ' + spmTemplate + ' to ' + spmDirectory, 'dry-run', options.dryRun, LOGGER_LEVELS.INFO);

  if (options.dryRun) return;

  try {
    await ensureDir(spmDirectory);
    await extract({ file: spmTemplate, cwd: spmDirectory });
  } catch (err) {
    logger.error('Failed to create ' + spmDirectory + ' with error: ' + err);
  }
}

export async function removeCocoapodsFiles(config: Config, options: MigrateSPMInteractiveOptions): Promise<void> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  const podFile = resolve(iosDirectory, 'Podfile');
  const podlockFile = resolve(iosDirectory, 'Podfile.lock');
  const xcworkspaceFile = resolve(iosDirectory, 'App.xcworkspace');

  await removeWithOptions(podFile, options);
  await removeWithOptions(podlockFile, options);
  await removeWithOptions(xcworkspaceFile, options);
}

export async function generatePackageText(config: Config, plugins: Plugin[]): Promise<string> {
  const iosPlatformVersion = await getCapacitorPackageVersion(config, config.ios.name);
  const iosVersion = getMajoriOSVersion(config);

  let packageSwiftText = `// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v${iosVersion})],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "${iosPlatformVersion}")`;

  for (const plugin of plugins) {
    const relPath = relative(config.ios.nativeXcodeProjDirAbs, plugin.rootPath);
    packageSwiftText += `,\n        .package(name: "${plugin.ios?.name}", path: "${relPath}")`;
  }

  packageSwiftText += `
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")`;

  for (const plugin of plugins) {
    packageSwiftText += `,\n                .product(name: "${plugin.ios?.name}", package: "${plugin.ios?.name}")`;
  }

  packageSwiftText += `
            ]
        )
    ]
)
`;

  return packageSwiftText;
}

export async function runCocoapodsDeintegrate(config: Config, options: MigrateSPMInteractiveOptions): Promise<void> {
  const podPath = await config.ios.podPath;
  const projectFileName = config.ios.nativeXcodeProjDirAbs;
  const useBundler = podPath.startsWith('bundle') && (await isInstalled('bundle'));
  const podCommandExists = await isInstalled('pod');

  if (useBundler) logger.info('Found bundler, using it to run CocoaPods.');

  logger.info('Running pod deintegrate on project ' + projectFileName);

  if (options.dryRun) return;

  if (useBundler || podCommandExists) {
    if (useBundler) {
      await runCommand('bundle', ['exec', 'pod', 'deintegrate', projectFileName], {
        cwd: config.ios.nativeProjectDirAbs,
      });
    } else {
      await runCommand(podPath, ['deintegrate', projectFileName], {
        cwd: config.ios.nativeProjectDirAbs,
      });
    }
  } else {
    logger.warn('Skipping pod deintegrate because CocoaPods is not installed - migration will be incomplete');
  }
}

// Private Functions

async function pluginsWithPackageSwift(plugins: Plugin[]): Promise<Plugin[]> {
  const pluginList = Promise.all(
    plugins.filter(async (plugin, _index, _array) => {
      const packageSwiftFound = await pathExists(plugin.rootPath + '/Package.swift');
      if (packageSwiftFound) {
        return plugin;
      } else {
        logger.warn(plugin.name + ' does not have a Package.swift');
      }
    }),
  );

  return pluginList;
}

async function removeWithOptions(dir: string, options: MigrateSPMInteractiveOptions): Promise<void> {
  const message = 'Deleting ' + dir;
  logOptSuffix(message, 'dry-run', options.dryRun, LOGGER_LEVELS.INFO);

  if (options.dryRun) return;

  remove(dir);
}
