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
  app_id: string | null;
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

/**
 * The option values that are safe to report, keyed by the option's resolved
 * name (commander's `attributeName()`, so `--signing-type` is `signingType`).
 * This is an allowlist by design: a denylist of password-like names would leak
 * the first sensitive option someone adds.
 *
 * The option declarations in `index.ts` spread these same lists into
 * `.choices()`, so an option cannot offer a choice this does not list.
 */
export const TELEMETRY_SAFE_CHOICES = {
  androidreleasetype: ['AAB', 'APK'],
  signingType: ['apksigner', 'jarsigner'],
  xcodeExportMethod: [
    'app-store-connect',
    'release-testing',
    'enterprise',
    'debugging',
    'developer-id',
    'mac-application',
    'validation',
  ],
  xcodeSigningStyle: ['automatic', 'manual'],
} as const satisfies Record<string, readonly string[]>;

const telemetrySafeChoices = new Map<string, ReadonlySet<string>>(
  Object.entries(TELEMETRY_SAFE_CHOICES).map(([name, choices]) => [name, new Set<string>(choices)]),
);

/**
 * Positional argument values that are safe to report. Everything else is
 * dropped, since arguments like `cap init`'s app name are user content.
 */
const TELEMETRY_ARGUMENT_ALLOWLIST = new Set(['android', 'ios', 'web']);

/**
 * Upper bound on the reported error, so a failed Gradle or Xcode build cannot
 * ship its entire log as a metric.
 */
const TELEMETRY_ERROR_MAX_LENGTH = 500;

/**
 * Shortest value worth scrubbing out of a reported error. An empty string would
 * match between every character, and a one- or two-character option value--a
 * port, a target index--appears throughout unrelated output, so redacting
 * either destroys the error instead of sanitizing it.
 */
const TELEMETRY_REDACTION_MIN_LENGTH = 3;

/**
 * The characters a dependency spec may contain to be reported as-is. A version
 * range has none of the `:/@` a URL or path spec needs, so specs such as
 * `git+https://x-access-token:<token>@github.com/acme/plugin.git` and
 * `file:/Users/<name>/dev/plugin` are reported as {@link NON_REGISTRY_VERSION}
 * instead of shipping a credential or a local path. The pnpm and yarn workspace
 * protocols are allowed through as the only exception, since they resolve
 * within the repo and so cannot carry either.
 */
const TELEMETRY_SAFE_VERSION_PATTERN = /^(?:(?:workspace|catalog):)?[\w.\-+^~><=|* ]*$/;

const NON_REGISTRY_VERSION = 'non-registry';

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

  let sysconfig = await readConfig();

  // The notice and the persisted default only mean anything where a person can
  // see them, so a headless run leaves the choice unmade rather than
  // committing one it was never offered.
  if (isInteractive() && !error && typeof sysconfig.telemetry === 'undefined') {
    // Telemetry is opt-out; turn telemetry on then inform the user how to opt-out.
    sysconfig = { ...sysconfig, telemetry: true };
    await writeConfig(sysconfig);

    output.write(THANK_YOU);
  }

  // Settled before the payload is built rather than at delivery: identifying
  // the project walks the whole commit graph.
  if (!isTelemetryEnabled(process.env, sysconfig, runContext)) {
    debug('Telemetry is off for this run--not collecting');

    return;
  }

  const packages = Object.entries({
    ...config.app.package.devDependencies,
    ...config.app.package.dependencies,
  });

  // Only collect packages in the capacitor org:
  // https://www.npmjs.com/org/capacitor
  const capacitorPackages = packages.filter(([k]) => k.startsWith('@capacitor/'));

  const versions = capacitorPackages.map(([k, v]): [string, string] => [
    `${k.replace(/^@capacitor\//, '').replace(/-/g, '_')}_version`,
    getTelemetryVersion(v),
  ]);

  // Both identifiers derive from this, and `git rev-list --max-parents=0`
  // walks the whole history — so it is fetched once for the pair.
  const firstCommit = await getFirstCommit(config);

  const options = getTelemetryOptions(cmd);

  const data: CommandMetricData = {
    app_id: await getAppIdentifier(firstCommit),
    ...(await getProjectIdentity(firstCommit, runContext)),
    command: getFullCommandName(cmd),
    arguments: getTelemetryArguments(cmd),
    options: JSON.stringify(options),
    duration,
    error: getTelemetryError(cmd, error, config, options),
    node_version: process.version,
    os: config.cli.os,
    ios_package_manager: await getIOSPackageManager(config),
    ...runContextFields(runContext),
    ...Object.fromEntries(versions),
  };

  debug('metric payload: %O', data);

  await sendMetric(sysconfig, 'capacitor_cli_command', data, runContext);
}

/**
 * Build the reported option map: every option name the command resolved, but
 * only the values that cannot carry a secret. Booleans are kept because they
 * cannot encode one, allowlisted options are kept when the value is one this
 * file lists, and every other value--keystore passwords, paths, signing
 * identities--becomes `null`.
 */
export function getTelemetryOptions(cmd: Command): Record<string, string | boolean | null> {
  return Object.fromEntries(
    Object.entries(cmd.opts()).map(([name, value]) => [name, isTelemetrySafeValue(name, value) ? value : null]),
  );
}

function isTelemetrySafeValue(name: string, value: unknown): value is string | boolean {
  if (typeof value === 'boolean') {
    return true;
  }

  return typeof value === 'string' && (telemetrySafeChoices.get(name)?.has(value) ?? false);
}

/**
 * The signing credentials `capacitor.config` can supply. `cap build` falls back
 * to the config for each of these when the flag is absent, and the resolved
 * value still reaches the `xcodebuild` and `jarsigner` command lines--so it can
 * come back in their output without ever having appeared in `cmd.opts()`.
 */
function getConfiguredCredentials(config: Config): string[] {
  return [
    config.android.buildOptions.keystorePath,
    config.android.buildOptions.keystorePassword,
    config.android.buildOptions.keystoreAlias,
    config.android.buildOptions.keystoreAliasPassword,
    config.ios.buildOptions.teamId,
    config.ios.buildOptions.signingCertificate,
    config.ios.buildOptions.provisioningProfile,
  ].filter((value): value is string => typeof value === 'string');
}

/**
 * Build the reported error, scrubbed of every option value and positional
 * argument the rest of the payload drops, plus the signing credentials the
 * config can supply in place of a flag, then truncated.
 *
 * Failed subprocesses rethrow the tool's combined output, which echoes back
 * the very values that were redacted out of the option map--`xcodebuild`
 * prints its command-line build settings, `jarsigner` prints the keystore it
 * was pointed at.
 */
export function getTelemetryError(
  cmd: Command,
  error: any,
  config: Config,
  options: Record<string, string | boolean | null> = getTelemetryOptions(cmd),
): string | null {
  if (!error) {
    return null;
  }

  const values = cmd.opts();
  const redacted = [
    ...Object.entries(options)
      .filter(([, value]) => value === null)
      .map(([name]) => values[name]),
    ...cmd.args.filter((arg) => !TELEMETRY_ARGUMENT_ALLOWLIST.has(arg)),
    ...getConfiguredCredentials(config),
  ]
    .filter((value): value is string => typeof value === 'string' && value.length >= TELEMETRY_REDACTION_MIN_LENGTH)
    .sort((a, b) => b.length - a.length);

  const message = redacted.reduce<string>(
    (message, value) => message.replaceAll(value, '<redacted>'),
    error.message ? error.message : String(error),
  );

  return message.slice(0, TELEMETRY_ERROR_MAX_LENGTH);
}

/**
 * Build the reported positional arguments, keeping only allowlisted values.
 */
export function getTelemetryArguments(cmd: Command): string {
  return cmd.args.filter((arg) => TELEMETRY_ARGUMENT_ALLOWLIST.has(arg)).join(' ');
}

/**
 * Build the reported version of a Capacitor dependency, keeping the spec only
 * when it is a version range. Specs that point somewhere--a git URL, a local
 * path--are reported as being just that, since they can carry a token or a
 * username.
 */
export function getTelemetryVersion(spec: string | undefined): string {
  return spec && TELEMETRY_SAFE_VERSION_PATTERN.test(spec) ? spec : NON_REGISTRY_VERSION;
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

  if (needsAwaitedDelivery(runContext)) {
    await deliver(message);
  } else {
    await send({ type: 'telemetry', data: message });
  }
}

/**
 * Whether the POST has to finish before the CLI exits.
 *
 * Delivery normally goes to a forked process and costs the command nothing.
 * That process is not `detached` and still has to cold-start Node before it
 * reaches the network, so an environment reclaimed the moment the CLI returns
 * takes it with it mid-request. Anything that outlives the command — a
 * harness on a developer's machine included — detaches like a human run.
 */
export function needsAwaitedDelivery(runContext: RunContext): boolean {
  return isAgentDriven(runContext) && runContext.surface === 'cloud-sandbox';
}

export function isTelemetryDisabledByEnv(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.CAP_TELEMETRY_DISABLED);
}

/**
 * Whether a metric may be delivered for this run.
 *
 * An explicit choice always wins. Only the default for an unmade choice
 * depends on the run: the notice is printed at a terminal and nowhere else, so
 * a first run inside a Docker build or a git hook has had no chance to show it
 * and reporting there would put the data ahead of the disclosure. An agent
 * sandbox never reaches that path at all, which is why `undefined` means yes
 * there and no everywhere else.
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
export function runContextFields(
  runContext: RunContext,
): Pick<CommandMetricData, 'surface' | 'confidence' | 'agent_id' | 'agent_version' | 'agent_detected_by'> {
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
 * The repository's first commit is the same on every machine, which makes it
 * the preferred key — though where there is one this is `app_id` under a
 * different hash, and `project_id_source` is what tells the two apart. The
 * case this exists for is a freshly scaffolded app with no commit yet, where
 * the harness session identifier stands in — hashed here, never transmitted,
 * which is why the run context carries only the variable's name.
 */
export async function getProjectIdentity(
  firstCommit: string | undefined,
  runContext: RunContext,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Pick<CommandMetricData, 'project_id' | 'project_id_source'>> {
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
 * Get a unique anonymous identifier for this app from the repository's first
 * commit, which should be universally unique.
 */
async function getAppIdentifier(firstCommit: string | undefined): Promise<string | null> {
  if (!firstCommit) {
    debug('Could not obtain unique app identifier');
    return null;
  }

  const { createHash } = await import('crypto');

  // use sha1 to create a one-way hash to anonymize
  return createHash('sha1').update(firstCommit).digest('hex');
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
