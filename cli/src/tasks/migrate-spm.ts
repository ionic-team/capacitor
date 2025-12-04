import type { Config } from '../definitions.js';
import { fatal } from '../errors.js';
import { logger } from '../log.js';
import {
  checkPackageManager,
  extractSPMPackageDirectory,
  removeCocoapodsFiles,
  runCocoapodsDeintegrate,
  addInfoPlistDebugIfNeeded,
} from '../util/spm.js';

import { update } from './update.js';

export async function migrateToSPM(config: Config): Promise<void> {
  if ((await checkPackageManager(config)) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }

  await extractSPMPackageDirectory(config);
  await runCocoapodsDeintegrate(config);
  await removeCocoapodsFiles(config);
  await addInfoPlistDebugIfNeeded(config);
  await update(config, 'ios', true);

  logger.info(
    'To complete migration follow the manual steps at https://capacitorjs.com/docs/ios/spm#using-our-migration-tool',
  );
}
