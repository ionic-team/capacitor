import {
  existsSync,
  readFileSync,
  writeFileSync,
} from '@ionic/utils-fs';
import { relative, resolve } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import type { Plugin } from '../plugin';

export async function generatePackageFile(
  config: Config,
  plugins: Plugin[],
): Promise<string> {
  const swiftPluginList: string[] = [];

  for (const plugin of plugins) {
    const relPath = relative(config.ios.nativeXcodeProjDirAbs, plugin.rootPath);
    const pluginStatement = `.package(name: "${plugin.ios?.name}", path: "${relPath}")`;
    swiftPluginList.push(pluginStatement);
  }

  const packageDirectory = resolve(
    config.ios.nativeProjectDirAbs,
    'CapApp-SPM',
  );
  const packageSwiftFile = resolve(packageDirectory, 'Package.swift');
  try {
    if (!existsSync(packageSwiftFile)) {
      logger.error(
        `Unable to find ${packageSwiftFile}. Try updating it manually`,
      );
    }
    const packageSwiftText = readFileSync(packageSwiftFile, 'utf-8');
    const packageSwiftTextLines = packageSwiftText.split('\n');

    let textToWrite = '';
    for (const line of packageSwiftTextLines) {
      textToWrite += line + '\n';
      if (line.includes('.package(name: "Capacitor"')) {
        for (const swiftPlugin of swiftPluginList) {
          textToWrite += '        ' + swiftPlugin + '\n';
        }
      }
    }

    writeFileSync(packageSwiftFile, textToWrite);
  } catch (err) {
    logger.error(
      `Unable to read ${packageSwiftFile}. Verify it is not already open. ${err}`,
    );
  }

  return '';
}

export async function checkPackageManager(config: Config): Promise<string> {
  const iosDirectory = config.ios.nativeProjectDirAbs;
  if (existsSync(resolve(iosDirectory, 'CapApp-SPM'))) {
    return 'SPM';
  }

  return 'Cocoapods';
}
