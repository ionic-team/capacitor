import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import type { Plugin} from '../plugin';
import { getPlugins, printPlugins } from '../plugin'
import { checkPackageManager, generatePackageFile, iosPluginsWithPackageSwift, createSPMDirectory } from '../util/spm';

export async function migrateToSPM(config: Config, dryRun: boolean, unsafe: boolean): Promise<void> {
  if (dryRun) logger.warn('Dry-run enabled, no actions will be taken.');
  if (unsafe) logger.warn('Unsafe mode enabled, no file backups will be made.');

  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  logger.info("iOS Plugins Found")

  // Create CapAPP-SPM directory (including Sources/CapAPP-SPM)
  await createSPMDirectory(config)

  // Delete or Rename XCWorkspace

  // Delete or Rename Pods directory

  // Extra needed data from Podfile?

  // Delete or Rename Podfile/Podfile.lock

  // Add Package.swift
  const packageSwiftPluginList = await processIosPackages(config)
  if (!dryRun) {
    await generatePackageFile(config, packageSwiftPluginList)
  }
}

async function processIosPackages(config: Config): Promise<Plugin[]> {
  const plugins = await getPlugins(config, 'ios')
  printPlugins(plugins, "ios", "capacitor")

  const packageSwiftPluginList = await iosPluginsWithPackageSwift(plugins)
  printPlugins(packageSwiftPluginList, "ios", "packagespm")

  if( plugins.length == packageSwiftPluginList.length ) {
    logger.info("Number of plugins in lists match") // TODO: Word this better
  } else {
    logger.warn("Some installed packages my not be compatable with SPM")
  }

  return packageSwiftPluginList
}

