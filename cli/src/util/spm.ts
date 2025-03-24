import { pathExists, existsSync, readFileSync, writeFileSync, ensureDir } from 'fs-extra';
import { join, relative, resolve } from 'path';

import { getCapacitorPackageVersion } from '../common';
import type { Config } from '../definitions';
import { getIOSPlugins } from '../ios/common';
import { logger } from '../log';
import type { Plugin } from '../plugin';

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
    logger.info("Writing Package.swift")
    const textToWrite = await generatePackageText(config, plugins);
    writeFileSync(packageSwiftFile, textToWrite);
  } catch (err) {
    logger.error(`Unable to write to ${packageSwiftFile}. Verify it is not already open. \n Error: ${err}`);
  }
}

export async function iosPluginsWithPackageSwift(plugins: Plugin[]): Promise<Plugin[]> {
  const packageList = await pluginsWithPackageSwift(plugins)
  const iosPackageList = await getIOSPlugins(packageList)

  return iosPackageList
}

export async function createSPMDirectory(config: Config): Promise<void> {
  const spmDirectory = join(config.ios.nativeProjectDirAbs, 'CapApp-SPM')
  try {
    logger.info("Creating " + spmDirectory + "...")
    await ensureDir(spmDirectory)
  } catch (err) {
    logger.error("Failed to create " + spmDirectory)
  }
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
  const pluginList = Promise.all(plugins.filter(async (plugin, _index, _array) => {
    const packageSwiftFound = await pathExists(plugin.rootPath + "/Package.swift")
    if (packageSwiftFound) {
      return plugin
    } else {
      logger.warn(plugin.name + " does not have a Package.swift")
    }
  }))

  return pluginList
}
