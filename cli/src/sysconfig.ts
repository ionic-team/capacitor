import Debug from 'debug';
import { readJSON, writeJSON, mkdirp } from 'fs-extra';
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

  /**
   * Whether the user chooses to sign up or not.
   *
   * If undefined, the prompt has not been shown.
   */
  readonly signup?: boolean;
}
