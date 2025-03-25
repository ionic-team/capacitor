import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import type { Plugin} from '../plugin';
import { getPlugins, printPlugins } from '../plugin'
import { checkPackageManager, generatePackageFile, iosPluginsWithPackageSwift, createSPMDirectory, removeCocoapodsFiles } from '../util/spm';

export async function migrateToSPM(config: Config, dryRun: boolean, unsafe: boolean): Promise<void> {
  if (dryRun) logger.warn('Dry-run enabled, no actions will be taken.');
  if (unsafe) logger.warn('Unsafe mode enabled, no file backups will be made.');

  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  await createSPMDirectory(config, dryRun)
  removeCocoapodsFiles(config, dryRun, unsafe)



  // TODO: Check if Extra data is needed data from Podfile?

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

