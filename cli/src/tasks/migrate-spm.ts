import type { Config } from '../definitions';
import { logger } from '../log';
import { checkPackageManager } from '../util/spm';

export async function migrateToSPM(config: Config, dryRun: boolean): Promise<void> {
  if (dryRun) {
    logger.warn('--dry-run enabled, no actions will be taken');
  }

  if ((await checkPackageManager(config)) == 'SPM') {
    logger.error('Capacitor project is already using SPM, exiting');
  }
}
