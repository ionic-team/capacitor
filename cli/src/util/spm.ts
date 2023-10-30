import { existsSync, readFile, writeFile } from '@ionic/utils-fs';
import { resolve } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';
import { PluginType, getPluginPlatform } from '../plugin';
import type { Plugin } from '../plugin';
import { isInstalled, runCommand } from '../util/subprocess';


async function generatePackageFile(
    config: Config,
    plugins: Plugin[],
  ): Promise<string> {
    return ""
}


async function updatePackageFile(
    config: Config,
    plugins: Plugin[]
  ): Promise<void> {
    return
  }


export async function checkPackageManager(config: Config): Promise<string> {
    const iosDirectory = config.ios.nativeProjectDirAbs
    if (existsSync(resolve(iosDirectory, 'CapApp-SPM'))) {
      return 'SPM'
    }

    return 'Cocoapods'
  }
