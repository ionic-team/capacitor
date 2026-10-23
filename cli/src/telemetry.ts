import { Command } from 'commander';
import Debug from 'debug';
import { pathExists } from 'fs-extra';

import c from './colors';
import type { Config, PackageManager } from './definitions';
import { deliver, send } from './ipc';
import { output } from './log';
import { detectRunContext, isAgentDriven } from './run-context';
import type { Confidence, RunContext, Surface } from './run-context';
import { readConfig, writeConfig } from './sysconfig';
import type { SystemConfig } from './sysconfig';
import { getCommandOutput } from './util/subprocess';
import { isInteractive } from './util/term';

const debug = Debug('capacitor:telemetry');

const THANK_YOU =
  `\nThank you for helping improve Capacitor by sharing anonymous usage data! 💖` +
  `\nInformation about the data we collect is available on our website: ${c.strong('https://capacitorjs.com/docs/next/cli/telemetry')}` +
  `\nYou can disable telemetry at any time by using the ${c.input('npx cap telemetry off')} command.`;

/**
 * Which identifier `project_id` was derived from. A `session` id is unique to
 * one agent session, so repeated runs against an uncommitted project still
 * count more than once — downstream analysis needs to know that.
 */
export type ProjectIdSource = 'repository' | 'session' | 'none';

export interface CommandMetricData {
  app_id: string;
  project_id: string | null;
  project_id_source: ProjectIdSource;
  command: string;
  arguments: string;
  options: string;
  duration: number;
  error: string | null;
  node_version: string;
  os: string;
  ios_package_manager: PackageManager | 'unknown';
  surface: Surface;
  confidence: Confidence;
  agent_id?: string;
  agent_version?: string;
  agent_detected_by?: string;
}

export interface Metric<N extends string, D> {
  name: N;
  timestamp: string;
  session_id: string;
  source: 'capacitor_cli';
  value: D;
}

type CommanderAction = (...args: any[]) => void | Promise<void>;

export function telemetryAction(config: Config, action: CommanderAction): CommanderAction {
  return async (...actionArgs: any[]): Promise<void> => {
    const start = new Date();
    // This is how commanderjs works--the command object is either the last
    // element or second to last if there are additional options (via `.allowUnknownOption()`)
    const lastArg = actionArgs[actionArgs.length - 1];
    const cmd: Command = lastArg instanceof Command ? lastArg : actionArgs[actionArgs.length - 2];
    let error: any;

    try {
      await action(...actionArgs);
    } catch (e) {
      error = e;
    }

    const end = new Date();

    await reportCommand(config, cmd, end.getTime() - start.getTime(), error);

    if (error) {
      throw error;
    }
  };
}

/**
 * Build and deliver the metric for one completed command.
 */
async function reportCommand(config: Config, cmd: Command, duration: number, error: any): Promise<void> {
  // Read before detection and before stored consent, so the opt-out holds in
  // environments with no filesystem to have stored one.
  if (isTelemetryDisabledByEnv(process.env)) {
    debug('CAP_TELEMETRY_DISABLED is set--not collecting');

    return;
  }

  const runContext = detectRunContext();

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
    ...(await getProjectIdentity(config, runContext)),
    command: getFullCommandName(cmd),
    arguments: cmd.args.join(' '),
    options: JSON.stringify(cmd.opts()),
    duration,
    error: error ? (error.message ? error.message : String(error)) : null,
    node_version: process.version,
    os: config.cli.os,
    ios_package_manager: await getIOSPackageManager(config),
    ...runContextFields(runContext),
    ...Object.fromEntries(versions),
  };

  debug('metric payload: %O', data);

  let sysconfig = await readConfig();

  // The notice and the persisted default only mean anything where a person can
  // see them, so a headless run leaves the choice unmade rather than
  // committing one it was never offered. `isTelemetryEnabled` decides what an
  // unmade choice means for the run in hand.
  if (isInteractive() && !error && typeof sysconfig.telemetry === 'undefined') {
    // Telemetry is opt-out; turn telemetry on then inform the user how to opt-out.
    sysconfig = { ...sysconfig, telemetry: true };
    await writeConfig(sysconfig);

    output.write(THANK_YOU);
  }

  await sendMetric(sysconfig, 'capacitor_cli_command', data, runContext);
}

/**
 * If telemetry is enabled, send a metric via IPC to a forked process for uploading.
 */
export async function sendMetric<D>(
  sysconfig: Pick<SystemConfig, 'machine' | 'telemetry'>,
  name: string,
  data: D,
  runContext: RunContext,
): Promise<void> {
  if (!isTelemetryEnabled(process.env, sysconfig, runContext)) {
    debug('Telemetry is off (user choice, unshown notice, opt-out variable, or CI)--not sending metric');

    return;
  }

  const message: Metric<string, D> = {
    name,
    timestamp: new Date().toISOString(),
    session_id: sysconfig.machine,
    source: 'capacitor_cli',
    value: data,
  };

  // A developer has a terminal to get back, so delivery is handed to a
  // detached process and forgotten. An agent sandbox is often torn down the
  // moment the CLI exits, taking that process with it before the request
  // leaves the machine — so those runs wait for it instead.
  if (isAgentDriven(runContext)) {
    await deliver(message);
  } else {
    await send({ type: 'telemetry', data: message });
  }
}

export function isTelemetryDisabledByEnv(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.CAP_TELEMETRY_DISABLED);
}

/**
 * Whether a metric may be delivered for this run.
 *
 * An explicit choice always wins, whatever the run looks like. Only the
 * *default* for an unmade choice depends on the run: an agent sandbox never
 * reaches the interactive path that writes the default, so reading `undefined`
 * as "no" there would silently drop the entire population this reports on.
 *
 * Everywhere else `undefined` stays "no", because the notice is only ever
 * printed at a terminal — a first run inside a Docker build, a git hook or
 * `cap sync | tee` has had no chance to show it, and reporting from there
 * would put the data ahead of the disclosure.
 */
export function isTelemetryEnabled(
  env: NodeJS.ProcessEnv,
  sysconfig: Pick<SystemConfig, 'telemetry'>,
  runContext: RunContext,
): boolean {
  if (isTelemetryDisabledByEnv(env)) {
    return false;
  }

  if (!runContext.report) {
    return false;
  }

  if (typeof sysconfig.telemetry === 'boolean') {
    return sysconfig.telemetry;
  }

  return isAgentDriven(runContext);
}

/**
 * Map the run context onto payload fields. Agent keys are omitted rather than
 * nulled when no agent was detected, so "no agent" and "an agent we couldn't
 * name" stay distinguishable downstream.
 */
export function runContextFields(runContext: RunContext): Partial<CommandMetricData> {
  return {
    surface: runContext.surface,
    confidence: runContext.confidence,
    ...(runContext.agentId ? { agent_id: runContext.agentId } : {}),
    ...(runContext.agentVersion ? { agent_version: runContext.agentVersion } : {}),
    ...(runContext.agentDetectedBy ? { agent_detected_by: runContext.agentDetectedBy } : {}),
  };
}

/**
 * Identify the project this run belongs to, so repeated runs against one app
 * count once however many machines they came from.
 *
 * The repository's first commit is the same on every machine, which is what
 * makes it the preferred key. A freshly scaffolded app has no commit yet, so
 * the harness session identifier stands in — hashed here, never transmitted,
 * which is why the run context carries only the variable's name.
 */
export async function getProjectIdentity(
  config: Config,
  runContext: RunContext,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Pick<CommandMetricData, 'project_id' | 'project_id_source'>> {
  const firstCommit = await getFirstCommit(config);

  if (firstCommit) {
    return { project_id: await hash(firstCommit), project_id_source: 'repository' };
  }

  const session = runContext.sessionVar ? env[runContext.sessionVar] : undefined;

  if (session) {
    return { project_id: await hash(session), project_id_source: 'session' };
  }

  debug('Could not obtain a project identifier');

  return { project_id: null, project_id_source: 'none' };
}

async function hash(value: string): Promise<string> {
  const { createHash } = await import('crypto');

  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

async function getFirstCommit(config: Config): Promise<string | undefined> {
  const output = await getCommandOutput('git', ['rev-list', '--max-parents=0', 'HEAD'], {
    cwd: config.app.rootDir,
  });

  return output?.split('\n')[0] || undefined;
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
