import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger } from '../log';
import {
  checkPackageManager,
  extractSPMPackageDirectory,
  removeCocoapodsFiles,
  runCocoapodsDeintegrate,
  addInfoPlistDebugIfNeeded,
} from '../util/spm';
import { update } from './update';

export async function migrateToSPM(config: Config): Promise<void> {
  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  await extractSPMPackageDirectory(config);
  await runCocoapodsDeintegrate(config);
  await removeCocoapodsFiles(config);
  await addInfoPlistDebugIfNeeded(config);
  await update(config, 'ios', true)

  logger.info(
    'To complete migration follow the manual steps at https://capacitorjs.com/docs/ios/spm#using-our-migration-tool',
  );
}
