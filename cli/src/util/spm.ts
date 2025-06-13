import { pathExists, existsSync, readFileSync, writeFileSync, remove, move, mkdtemp } from 'fs-extra';
import { tmpdir } from 'os';
import { join, relative, resolve } from 'path';
import type { PlistObject } from 'plist';
import { build, parse } from 'plist';
import { extract } from 'tar';

import { getCapacitorPackageVersion } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { getMajoriOSVersion } from '../ios/common';
import { logger } from '../log';
import type { Plugin } from '../plugin';
import { getPluginType, PluginType } from '../plugin';
import { runCommand, isInstalled } from '../util/subprocess';

export interface SwiftPlugin {
  name: string;
  path: string;
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

export async function checkPluginsForPackageSwift(config: Config, plugins: Plugin[]): Promise<Plugin[]> {
  const iOSCapacitorPlugins = plugins.filter((p) => getPluginType(p, 'ios') === PluginType.Core);

  const packageSwiftPluginList = await pluginsWithPackageSwift(iOSCapacitorPlugins);

  if (plugins.length == packageSwiftPluginList.length) {
    logger.debug(`Found ${plugins.length} iOS plugins, ${packageSwiftPluginList.length} have a Package.swift file`);
    logger.info('All plugins have a Package.swift file and will be included in Package.swift');
  } else {
    logger.warn('Some installed packages my not be compatable with SPM');
  }

  return packageSwiftPluginList;
}

export async function extractSPMPackageDirectory(config: Config): Promise<void> {
  const spmDirectory = join(config.ios.nativeProjectDirAbs, 'CapApp-SPM');
  const spmTemplate = join(config.cli.assetsDirAbs, 'ios-spm-template.tar.gz');
  const debugConfig = join(config.ios.platformDirAbs, 'debug.xcconfig');

  logger.info('Extracting ' + spmTemplate + ' to ' + spmDirectory);

  try {
    const tempCapDir = await mkdtemp(join(tmpdir(), 'cap-'));
    const tempCapSPM = join(tempCapDir, 'App', 'CapApp-SPM');
    const tempDebugXCConfig = join(tempCapDir, 'debug.xcconfig');
    await extract({ file: spmTemplate, cwd: tempCapDir });
    await move(tempCapSPM, spmDirectory);
    await move(tempDebugXCConfig, debugConfig);
  } catch (err) {
    fatal('Failed to create ' + spmDirectory + ' with error: ' + err);
  }
}

export async function removeCocoapodsFiles(config: Config): Promise<void> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  const podFile = resolve(iosDirectory, 'Podfile');
  const podlockFile = resolve(iosDirectory, 'Podfile.lock');
  const xcworkspaceFile = resolve(iosDirectory, 'App.xcworkspace');

  await remove(podFile);
  await remove(podlockFile);
  await remove(xcworkspaceFile);
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
    if (getPluginType(plugin, config.ios.name) === PluginType.Cordova) {
      packageSwiftText += `,\n        .package(name: "${plugin.name}", path: "../../capacitor-cordova-ios-plugins/sources/${plugin.name}")`;
    } else {
      const relPath = relative(config.ios.nativeXcodeProjDirAbs, plugin.rootPath);
      packageSwiftText += `,\n        .package(name: "${plugin.ios?.name}", path: "${relPath}")`;
    }
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

export async function runCocoapodsDeintegrate(config: Config): Promise<void> {
  const podPath = await config.ios.podPath;
  const projectFileName = config.ios.nativeXcodeProjDirAbs;
  const useBundler = podPath.startsWith('bundle') && (await isInstalled('bundle'));
  const podCommandExists = await isInstalled('pod');

  if (useBundler) logger.info('Found bundler, using it to run CocoaPods.');

  logger.info('Running pod deintegrate on project ' + projectFileName);

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

export async function addInfoPlistDebugIfNeeded(config: Config): Promise<void> {
  type Mutable<T> = { -readonly [P in keyof T]: T[P] };

  const infoPlist = resolve(config.ios.nativeTargetDirAbs, 'Info.plist');
  logger.info('Checking ' + infoPlist + ' for CAPACITOR_DEBUG');

  if (existsSync(infoPlist)) {
    const infoPlistContents = readFileSync(infoPlist, 'utf-8');
    const plistEntries = parse(infoPlistContents) as Mutable<PlistObject>;

    if (plistEntries['CAPACITOR_DEBUG'] === undefined) {
      logger.info('Writing CAPACITOR_DEBUG to ' + infoPlist);
      plistEntries['CAPACITOR_DEBUG'] = '$(CAPACITOR_DEBUG)';
      const plistToWrite = build(plistEntries);
      writeFileSync(infoPlist, plistToWrite);
    } else {
      logger.warn('Found CAPACITOR_DEBUG set to ' + plistEntries['CAPACITOR_DEBUG'] + ', skipping.');
    }
  } else {
    logger.warn(infoPlist + ' not found.');
  }
}

// Private Functions

async function pluginsWithPackageSwift(plugins: Plugin[]): Promise<Plugin[]> {
  const pluginList: Plugin[] = [];
  for (const plugin of plugins) {
    const packageSwiftFound = await pathExists(join(plugin.rootPath, 'Package.swift'));
    if (packageSwiftFound) {
      pluginList.push(plugin);
    } else {
      logger.warn(plugin.id + ' does not have a Package.swift');
    }
  }

  return pluginList;
}
