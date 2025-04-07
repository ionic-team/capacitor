import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import {
  checkPackageManager,
  generatePackageSwiftFile,
  processIosPackages,
  extractSPMPackageDirectory,
  removeCocoapodsFiles,
} from '../util/spm';

export async function migrateToSPM(config: Config, dryRun: boolean, unsafe: boolean): Promise<void> {
  if (dryRun) logger.warn('Dry-run enabled, no actions will be taken.');
  if (unsafe) logger.warn('Unsafe mode enabled, no file backups will be made.');

  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  await extractSPMPackageDirectory(config, dryRun);
  await removeCocoapodsFiles(config, dryRun, unsafe);

  // TODO: Add Cap-SPM to XCodeProj file

  const packageSwiftPluginList = await processIosPackages(config);
  if (!dryRun) {
    await generatePackageSwiftFile(config, packageSwiftPluginList);
  }
}
