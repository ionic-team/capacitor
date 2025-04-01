import { LOGGER_LEVELS } from '@ionic/cli-framework-output'; // Ugh, I hate this, lets yank it
import { pathExists, existsSync, readFileSync, writeFileSync, ensureDir, remove, move } from 'fs-extra';
import { join, relative, resolve } from 'path';

import { getCapacitorPackageVersion } from '../common';
import type { Config } from '../definitions';
import { getIOSPlugins } from '../ios/common';
import { logger, logOptSuffix } from '../log';
import type { Plugin } from '../plugin';
import { getPlugins, printPlugins } from '../plugin';

export interface SwiftPlugin {
  name: string;
  path: string;
}
interface InteractiveOptions {
  dryRun: boolean;
  unsafe: boolean;
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

export async function generatePackageSwiftFile(config: Config, plugins: Plugin[]): Promise<void> {
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

export async function createSPMDirectory(config: Config, dryRun: boolean): Promise<void> {
  const spmDirectory = join(config.ios.nativeProjectDirAbs, 'CapApp-SPM');

  logOptSuffix('Creating ' + spmDirectory, 'dry-run', dryRun, LOGGER_LEVELS.INFO);

  if (dryRun) return;

  try {
    await ensureDir(spmDirectory);
  } catch (err) {
    logger.error('Failed to create ' + spmDirectory + ' with error: ' + err);
  }
}

export async function removeCocoapodsFiles(config: Config, dryRun: boolean, unsafe: boolean): Promise<void> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  const podFile = resolve(iosDirectory, 'Podfile');
  const podlockFile = resolve(iosDirectory, 'Podfile.lock');
  const xcworkspaceFile = resolve(iosDirectory, 'App.xcworkspace');
  if (unsafe) logger.warn('Unsafe mode');

  await removeWithOptions(podFile, { dryRun: dryRun, unsafe: unsafe });
  await removeWithOptions(podlockFile, { dryRun: dryRun, unsafe: unsafe });
  await removeWithOptions(xcworkspaceFile, { dryRun: dryRun, unsafe: unsafe });
}

export async function generatePackageText(config: Config, plugins: Plugin[]): Promise<string> {
  const iosPlatformVersion = await getCapacitorPackageVersion(config, config.ios.name);

  const pbx = readFileSync(join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj'), 'utf-8');
  const searchString = 'IPHONEOS_DEPLOYMENT_TARGET = ';
  const iosVersion = pbx.substring(
    pbx.indexOf(searchString) + searchString.length,
    pbx.indexOf(searchString) + searchString.length + 2,
  );

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

async function removeWithOptions(dir: string, options: InteractiveOptions): Promise<void> {
  const backupName = dir + '.bak';
  const message = options.unsafe ? 'Deleting ' + dir : 'Moving ' + dir + ' to ' + backupName;

  logOptSuffix(message, 'dry-run', options.dryRun, LOGGER_LEVELS.INFO);

  if (options.dryRun) return;

  if (options.unsafe) {
    remove(dir);
  } else {
    move(dir, backupName);
  }
}
