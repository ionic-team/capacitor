import { Command } from 'commander';
import Debug from 'debug';

import c from './colors';
import type { Config } from './definitions';
import { send } from './ipc';
import { logPrompt, output } from './log';
import type { SystemConfig } from './sysconfig';
import { readConfig, writeConfig } from './sysconfig';
import { getCommandOutput } from './util/subprocess';
import { isInteractive } from './util/term';

const debug = Debug('capacitor:telemetry');

export const THANK_YOU =
  `\nThank you for helping to make Capacitor better! 💖` +
  `\nInformation about the data we collect is available on our website: ${c.strong(
    'https://capacitorjs.com/telemetry',
  )}\n`;

export interface CommandMetricData {
  app_id: string;
  command: string;
  arguments: string;
  options: string;
  duration: number;
  error: string | null;
  node_version: string;
  os: string;
}

export interface Metric<N extends string, D> {
  name: N;
  timestamp: string;
  session_id: string;
  source: 'capacitor_cli';
  value: D;
}

type CommanderAction = (...args: any[]) => void | Promise<void>;

export function telemetryAction(
  config: Config,
  action: CommanderAction,
): CommanderAction {
  return async (...actionArgs: any[]): Promise<void> => {
    const start = new Date();
    // This is how commanderjs works--the command object is either the last
    // element or second to last if there are additional options (via `.allowUnknownOption()`)
    const lastArg = actionArgs[actionArgs.length - 1];
    const cmd: Command =
      lastArg instanceof Command ? lastArg : actionArgs[actionArgs.length - 2];
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
    const capacitorPackages = packages.filter(([k]) =>
      k.startsWith('@capacitor/'),
    );

    const versions = capacitorPackages.map(([k, v]) => [
      `${k.replace(/^@capacitor\//, '').replace(/-/g, '_')}_version`,
      v,
    ]);

    const data: CommandMetricData = {
      app_id: await getAppIdentifier(config),
      command,
      arguments: cmd.args.join(' '),
      options: JSON.stringify(cmd.opts()),
      duration,
      error: error ? (error.message ? error.message : String(error)) : null,
      node_version: process.version,
      os: config.cli.os,
      ...Object.fromEntries(versions),
    };

    if (isInteractive()) {
      let sysconfig = await readConfig();

      if (!error && typeof sysconfig.telemetry === 'undefined') {
        const confirm = await promptForTelemetry();
        sysconfig = { ...sysconfig, telemetry: confirm };

        await writeConfig(sysconfig);
      }

      await sendMetric(sysconfig, 'capacitor_cli_command', data);
    }

    if (error) {
      throw error;
    }
  };
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
    debug(
      'Telemetry is off (user choice, non-interactive terminal, or CI)--not sending metric',
    );
  }
}

async function promptForTelemetry(): Promise<boolean> {
  const { confirm } = await logPrompt(
    `${c.strong(
      'Would you like to help improve Capacitor by sharing anonymous usage data? 💖',
    )}\n` +
      `Read more about what is being collected and why here: ${c.strong(
        'https://capacitorjs.com/telemetry',
      )}. You can change your mind at any time by using the ${c.input(
        'npx cap telemetry',
      )} command.`,
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Share anonymous usage data?',
      initial: true,
    },
  );

  if (confirm) {
    output.write(THANK_YOU);
  }

  return confirm;
}

/**
 * Get a unique anonymous identifier for this app.
 */
async function getAppIdentifier(config: Config): Promise<string | null> {
  const { createHash } = await import('crypto');

  // get the first commit hash, which should be universally unique
  const output = await getCommandOutput(
    'git',
    ['rev-list', '--max-parents=0', 'HEAD'],
    { cwd: config.app.rootDir },
  );

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
