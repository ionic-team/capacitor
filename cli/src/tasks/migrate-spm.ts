import { check } from '../common';
import type { Config, Writable } from '../definitions';
import { fatal } from '../errors';
import { getCommonChecks } from '../ios/common';
import { logger } from '../log';
import {
  extractSPMPackageDirectory,
  removeCocoapodsFiles,
  runCocoapodsDeintegrate,
  addInfoPlistDebugIfNeeded,
} from '../util/spm';

import { update } from './update';

export async function migrateToSPM(config: Config): Promise<void> {
  if ((await config.ios.packageManager) == 'SPM') {
    fatal('Capacitor project is already using SPM, exiting.');
  }
  await check(await getCommonChecks(config));
  await extractSPMPackageDirectory(config);
  await runCocoapodsDeintegrate(config);
  await removeCocoapodsFiles(config);
  await addInfoPlistDebugIfNeeded(config);
  const configWritable: Writable<Config> = config as Writable<Config>;
  configWritable.ios.packageManager = Promise.resolve('SPM');
  await update(configWritable as Config, 'ios', false);
  logger.info(
    'To complete migration follow the manual steps at https://capacitorjs.com/docs/ios/spm#using-our-migration-tool',
  );
}
