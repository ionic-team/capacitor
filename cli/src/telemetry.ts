import { Command } from 'commander';

import c from './colors';
import type { Config } from './definitions';
import { send } from './ipc';
import { readConfig } from './sysconfig';
import { isInteractive } from './util/term';

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
      app_id: '', // TODO
      command,
      arguments: cmd.args.join(' '),
      options: JSON.stringify(cmd.opts()),
      duration,
      error: error ? (error.message ? error.message : String(error)) : null,
      node_version: process.version,
      os: config.cli.os,
      ...Object.fromEntries(versions),
    };

    await sendMetric('capacitor_cli_command', data);

    if (error) {
      throw error;
    }
  };
}

export async function sendMetric<D>(name: string, data: D): Promise<void> {
  const sysconfig = await readConfig();

  if (sysconfig.telemetry && isInteractive()) {
    const message: Metric<string, D> = {
      name,
      timestamp: new Date().toISOString(),
      session_id: sysconfig.machine,
      source: 'capacitor_cli',
      value: data,
    };

    await send({ type: 'telemetry', data: message });
  }
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
