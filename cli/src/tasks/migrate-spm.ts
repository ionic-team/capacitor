import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import type { MigrateSPMInteractiveOptions } from '../util/spm';
import {
  checkPackageManager,
  generatePackageFile,
  processIosPackages,
  extractSPMPackageDirectory,
  removeCocoapodsFiles,
  runCocoapodsDeintegrate,
  addInfoPlistDebugIfNeeded,
} from '../util/spm';

export async function migrateToSPM(config: Config, options: MigrateSPMInteractiveOptions): Promise<void> {
  if (options.dryRun) logger.warn('Dry-run enabled, no actions will be taken.');

  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  await extractSPMPackageDirectory(config, options);
  await runCocoapodsDeintegrate(config, options);
  await removeCocoapodsFiles(config, options);
  await addInfoPlistDebugIfNeeded(config, options);
  // TODO: Add CAP-SPM package to project dependencies

  const packageSwiftPluginList = await processIosPackages(config);
  if (!options.dryRun) {
    await generatePackageFile(config, packageSwiftPluginList);
  }

  logger.info(
    'To complete migration follow the manual steps at https://capacitorjs.com/docs/ios/spm#using-our-migration-tool',
  );
}
