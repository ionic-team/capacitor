import { pathExists } from 'fs-extra';

import type { Config } from '../definitions';
import { logger } from '../log';
import { getPlugins, printPlugins, Plugin } from '../plugin'
import { checkPackageManager } from '../util/spm';

export async function migrateToSPM(config: Config, dryRun: boolean): Promise<void> {
  if (dryRun) {
    logger.warn('--dry-run enabled, no actions will be taken');
  }

  if ((await checkPackageManager(config)) == 'SPM') {
    logger.error('Capacitor project is already using SPM, exiting');
  }

  logger.info("iOS Plugins Found")
  const plugins = await getPlugins(config, 'ios')
  printPlugins(plugins, "ios", "capacitor")
  await pluginsWithPackageSwift(plugins)

}

async function pluginsWithPackageSwift(plugins: Plugin[]): Promise<Plugin[]> {
  const pluginList = Promise.all(plugins.filter(async (plugin, _index, _array) => {
    const packageSwiftFound = await pathExists(plugin.rootPath + "/Package.swift")
    if (packageSwiftFound) {
      logger.info("Found " + plugin.rootPath + "/Package.swift")
      return plugin
    } else {
      logger.warn(plugin.name + " does not have a Package.swift")
    }
  }))

  return pluginList
}
