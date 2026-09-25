import { Command } from 'commander';
import Debug from 'debug';
import { pathExists } from 'fs-extra';

import c from './colors';
import type { Config, PackageManager } from './definitions';
import { send } from './ipc';
import { output } from './log';
import { readConfig, writeConfig } from './sysconfig';
import type { SystemConfig } from './sysconfig';
import { getCommandOutput } from './util/subprocess';
import { isInteractive } from './util/term';

const debug = Debug('capacitor:telemetry');

const THANK_YOU =
  `\nThank you for helping improve Capacitor by sharing anonymous usage data! 💖` +
  `\nInformation about the data we collect is available on our website: ${c.strong('https://capacitorjs.com/docs/next/cli/telemetry')}` +
  `\nYou can disable telemetry at any time by using the ${c.input('npx cap telemetry off')} command.`;

export interface CommandMetricData {
  app_id: string;
  command: string;
  arguments: string;
  options: string;
  duration: number;
  error: string | null;
  node_version: string;
  os: string;
  ios_package_manager: PackageManager | 'unknown';
}

export interface Metric<N extends string, D> {
  name: N;
  timestamp: string;
  session_id: string;
  source: 'capacitor_cli';
  value: D;
}

type CommanderAction = (...args: any[]) => void | Promise<void>;

/**
 * Option names whose values are safe to report because the option declares a
 * fixed set of choices. This is an allowlist by design: a denylist of
 * password-like names would leak the first sensitive option someone adds.
 */
const TELEMETRY_OPTION_VALUE_ALLOWLIST = new Set([
  'androidreleasetype',
  'signingType',
  'xcodeExportMethod',
  'xcodeSigningStyle',
]);

/**
 * Positional argument values that are safe to report. Everything else is
 * dropped, since arguments like `cap init`'s app name are user content.
 */
const TELEMETRY_ARGUMENT_ALLOWLIST = new Set(['android', 'ios', 'web', 'on', 'off']);

export function telemetryAction(config: Config, action: CommanderAction): CommanderAction {
  return async (...actionArgs: any[]): Promise<void> => {
    const start = new Date();
    // This is how commanderjs works--the command object is either the last
    // element or second to last if there are additional options (via `.allowUnknownOption()`)
    const lastArg = actionArgs[actionArgs.length - 1];
    const cmd: Command = lastArg instanceof Command ? lastArg : actionArgs[actionArgs.length - 2];
    const command = getFullCommandName(cmd);
    let error: any;

    try {
      await action(...actionArgs);
    } catch (e) {
      error = e;
    }

    const end = new Date();
    const duration = end.getTime() - start.getTime();

    const packages = Object.entries({
      ...config.app.package.devDependencies,
      ...config.app.package.dependencies,
    });

    // Only collect packages in the capacitor org:
    // https://www.npmjs.com/org/capacitor
    const capacitorPackages = packages.filter(([k]) => k.startsWith('@capacitor/'));

    const versions = capacitorPackages.map(([k, v]) => [
      `${k.replace(/^@capacitor\//, '').replace(/-/g, '_')}_version`,
      v,
    ]);

    const data: CommandMetricData = {
      app_id: await getAppIdentifier(config),
      command,
      arguments: getTelemetryArguments(cmd),
      options: JSON.stringify(getTelemetryOptions(cmd)),
      duration,
      error: error ? (error.message ? error.message : String(error)) : null,
      node_version: process.version,
      os: config.cli.os,
      ios_package_manager: await getIOSPackageManager(config),
      ...Object.fromEntries(versions),
    };

    debug('metric payload: %O', data);

    if (isInteractive()) {
      let sysconfig = await readConfig();

      if (!error && typeof sysconfig.telemetry === 'undefined') {
        // Telemetry is opt-out; turn telemetry on then inform the user how to opt-out.
        sysconfig = { ...sysconfig, telemetry: true };
        await writeConfig(sysconfig);

        output.write(THANK_YOU);
      }

      await sendMetric(sysconfig, 'capacitor_cli_command', data);
    }

    if (error) {
      throw error;
    }
  };
}

/**
 * Build the reported option map: every option name the command resolved, but
 * only the values that cannot carry a secret. Booleans are kept because they
 * cannot encode one, fixed-choice options are kept by allowlist, and every
 * other value--keystore passwords, paths, signing identities--becomes `null`.
 */
export function getTelemetryOptions(cmd: Command): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(cmd.opts()).map(([name, value]) => [
      name,
      typeof value === 'boolean' || TELEMETRY_OPTION_VALUE_ALLOWLIST.has(name) ? value : null,
    ]),
  );
}

/**
 * Build the reported positional arguments, keeping only allowlisted values.
 */
export function getTelemetryArguments(cmd: Command): string {
  return cmd.args.filter((arg) => TELEMETRY_ARGUMENT_ALLOWLIST.has(arg)).join(' ');
}

/**
 * If telemetry is enabled, send a metric via IPC to a forked process for uploading.
 */
export async function sendMetric<D>(
  sysconfig: Pick<SystemConfig, 'machine' | 'telemetry'>,
  name: string,
  data: D,
): Promise<void> {
  if (sysconfig.telemetry && isInteractive()) {
    const message: Metric<string, D> = {
      name,
      timestamp: new Date().toISOString(),
      session_id: sysconfig.machine,
      source: 'capacitor_cli',
      value: data,
    };

    await send({ type: 'telemetry', data: message });
  } else {
    debug('Telemetry is off (user choice, non-interactive terminal, or CI)--not sending metric');
  }
}

/**
 * Resolve the iOS dependency manager for telemetry. Returns 'unknown' for
 * non-iOS projects or when detection throws, so callers never have to handle
 * errors from this signal.
 */
export async function getIOSPackageManager(config: Config): Promise<PackageManager | 'unknown'> {
  try {
    if (!(await pathExists(config.ios.platformDirAbs))) {
      return 'unknown';
    }

    return await config.ios.packageManager;
  } catch (e) {
    debug('Could not resolve iOS package manager for telemetry: %O', e);
    return 'unknown';
  }
}

/**
 * Get a unique anonymous identifier for this app.
 */
async function getAppIdentifier(config: Config): Promise<string | null> {
  const { createHash } = await import('crypto');

  // get the first commit hash, which should be universally unique
  const output = await getCommandOutput('git', ['rev-list', '--max-parents=0', 'HEAD'], { cwd: config.app.rootDir });

  const firstLine = output?.split('\n')[0];

  if (!firstLine) {
    debug('Could not obtain unique app identifier');
    return null;
  }

  // use sha1 to create a one-way hash to anonymize
  const id = createHash('sha1').update(firstLine).digest('hex');

  return id;
}

/**
 * Walk through the command's parent tree and construct a space-separated name.
 *
 * Probably overkill because we don't have nested commands, but whatever.
 */
function getFullCommandName(cmd: Command): string {
  const names: string[] = [];

  while (cmd.parent !== null) {
    names.push(cmd.name());
    cmd = cmd.parent;
  }

  return names.reverse().join(' ');
}
