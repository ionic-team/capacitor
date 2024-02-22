import { existsSync, readFileSync, writeFileSync } from '@ionic/utils-fs';
import { relative, resolve } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import type { Plugin } from '../plugin';

export interface SwiftPlugin {
  name: string;
  path: string;
}

export async function checkPackageManager(config: Config): Promise<string> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  if (existsSync(resolve(iosDirectory, 'CapApp-SPM'))) {
    return 'SPM';
  }

  return 'Cocoapods';
}

export async function findPackageSwiftFile(config: Config): Promise<string> {
  const packageDirectory = resolve(
    config.ios.nativeProjectDirAbs,
    'CapApp-SPM',
  );
  return resolve(packageDirectory, 'Package.swift');
}

function readSwiftPackage(packageLine: string): string | null {
  const packageRegex = RegExp(/.package\(\s*name:\s*"([A-Za-z0-9_-]+)"/);
  const lineMatch = packageLine.match(packageRegex);
  if (lineMatch === null) {
    return null;
  }

  return lineMatch[1];
}

function readSwiftProduct(productLine: string): string | null {
  const packageRegex = RegExp(/.product\(\s*name:\s*"([A-Za-z0-9_-]+)"/);
  const lineMatch = productLine.match(packageRegex);
  if (lineMatch === null) {
    return null;
  }

  return lineMatch[1];
}

export async function generatePackageFile(
  config: Config,
  plugins: Plugin[],
): Promise<void> {
  const swiftPluginList: string[] = [];
  const swiftPluginProductList: string[] = [];

  for (const plugin of plugins) {
    const relPath = relative(config.ios.nativeXcodeProjDirAbs, plugin.rootPath);
    const pluginStatement = `.package(name: "${plugin.ios?.name}", path: "${relPath}"),`;
    const pluginProduct = `.product(name: "${plugin.ios?.name}", package: "${plugin.ios?.name}"),`
    swiftPluginList.push(pluginStatement);
    swiftPluginProductList.push(pluginProduct);
  }

  const packageSwiftFile = await findPackageSwiftFile(config);

  try {
    if (!existsSync(packageSwiftFile)) {
      logger.error(
        `Unable to find ${packageSwiftFile}. Try updating it manually`,
      );
    }
    const packageSwiftText = readFileSync(packageSwiftFile, 'utf-8');
    const packageSwiftTextLines = packageSwiftText.split('\n');

    let textToWrite = '';
    const packages: string[] = [];
    const products: string[] = [];
    for (const lineIndex in packageSwiftTextLines) {
      const line = packageSwiftTextLines;
      const index = parseInt(lineIndex);

      if (
        line[index].includes('dependencies: [') &&
        line[index + 1].includes(
          '.package(url: "https://github.com/ionic-team/capacitor-spm.git", branch: "main")',
        )
      ) {
        let tempIndex = index + 1;
        while (!line[tempIndex].includes('],')) {
          const swiftPack = readSwiftPackage(line[tempIndex]);
          if (swiftPack !== null) {
            packages.push(swiftPack);
          }
          tempIndex++;
        }
      }

      if(
        line[index].includes('dependencies: [') &&
        line[index + 1].includes(
          '.product(name: "Capacitor", package: "capacitor-spm")',
        ) &&
        line[index + 2].includes(
          '.product(name: "Cordova", package: "capacitor-spm")',
        )
      ) {
        let tempIndex = index + 1;
        while (!line[tempIndex].includes(']')) {
          const swiftPack = readSwiftProduct(line[tempIndex]);
          if (swiftPack !== null) {
            console.log(swiftPack)
            products.push(swiftPack);
          }
          tempIndex++;
        }
      }

      if (
        line[index].includes(
          '.package(url: "https://github.com/ionic-team/capacitor-spm.git", branch: "main")',
        )
      ) {
        if (line[index].endsWith(',')) {
          textToWrite += line[index] + '\n';
        } else {
          textToWrite += line[index] + ',\n';
        }

        for (const swiftPlugin of swiftPluginList) {
          const name = readSwiftPackage(swiftPlugin) ?? '';
          if (!packages.includes(name)) {
            textToWrite += '        ' + swiftPlugin + '\n';
          }
        }
      } else if (
        line[index].includes(
          '.product(name: "Cordova", package: "capacitor-spm")',
        )
      ) {
          if (line[index].endsWith(',')) {
            textToWrite += line[index] + '\n';
          } else {
            textToWrite += line[index] + ',\n';
          }
          for (const swiftProduct of swiftPluginProductList) {
            const name = readSwiftProduct(swiftProduct) ?? ''
            if (!products.includes(name)) {
              textToWrite += '                ' + swiftProduct + '\n';
            }
          }
      } else {
        textToWrite += line[index] + '\n';
      }
    }

    writeFileSync(packageSwiftFile, textToWrite);
  } catch (err) {
    logger.error(
      `Unable to read ${packageSwiftFile}. Verify it is not already open. ${err}`,
    );
  }
}
