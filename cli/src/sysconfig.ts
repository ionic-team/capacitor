import { readJSON, writeJSON, mkdirp } from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, resolve } from 'path';

import { ENV_PATHS } from './util/cli';
import { uuidv4 } from './util/uuid';

const debug = Debug('capacitor:sysconfig');

const SYSCONFIG_FILE = 'sysconfig.json';
const SYSCONFIG_PATH = resolve(ENV_PATHS.config, SYSCONFIG_FILE);

export interface SystemConfig {
  /**
   * A UUID that anonymously identifies this computer.
   */
  readonly machine: string;

  /**
   * Whether telemetry is enabled or not.
   *
   * If undefined, a choice has not yet been made.
   */
  readonly telemetry?: boolean;
}

export async function readConfig(): Promise<SystemConfig> {
  debug('Reading from %O', SYSCONFIG_PATH);

  try {
    return await readJSON(SYSCONFIG_PATH);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }

    const sysconfig: SystemConfig = {
      machine: uuidv4(),
    };

    await writeConfig(sysconfig);

    return sysconfig;
  }
}

export async function writeConfig(sysconfig: SystemConfig): Promise<void> {
  debug('Writing to %O', SYSCONFIG_PATH);

  await mkdirp(dirname(SYSCONFIG_PATH));
  await writeJSON(SYSCONFIG_PATH, sysconfig, { spaces: '\t' });
}
