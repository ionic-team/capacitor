import { CI_ENVIRONMENT_VARIABLES } from '@ionic/utils-terminal';
import { Socket } from 'net';

import { detectDeclared } from './declared';
import { NO_TTY_SIGNAL, deriveSurface, scanSignals } from './signals';
import type { DetectRunContextOptions, RunContext, StreamStates } from './types';
import { detectUnknownHarness } from './unknown';
import { detectAgentVersion } from './version';

export type { Confidence, DetectRunContextOptions, RunContext, StreamStates, Surface } from './types';
export { CONVENTION_DENYLIST, CONVENTION_PATTERN } from './unknown';

/**
 * Any single signal happens legitimately — a `cat` pager, a missing TTY, a
 * local proxy. Three together, with no terminal anywhere, is what separates a
 * machine-driven run from a developer with an unusual setup.
 */
const HEURISTIC_THRESHOLD = 3;

/**
 * Classify this invocation as human, CI, or agent-driven from the environment
 * alone — no process spawn, no filesystem read.
 *
 * Every input is injectable and nothing is captured at module load, so tests
 * can drive the whole thing. This is also why `@ionic/utils-terminal`'s
 * `TERMINAL_INFO` isn't used: it snapshots the real process when the module is
 * first imported and freezes it.
 */
export function detectRunContext(options: DetectRunContextOptions = {}): RunContext {
  const env = options.env ?? process.env;
  const streams = options.streams ?? readStreamStates();
  const cwd = options.cwd ?? process.cwd();
  const execPath = options.execPath ?? process.execPath;

  const scan = scanSignals(env, streams, cwd, execPath);
  const surface = deriveSurface(env, scan);

  // CI is classified but never delivered, so nothing below needs to run.
  if (isCI(env)) {
    return { report: false, surface, confidence: 'none' };
  }

  const declared = detectDeclared(env);

  if (declared) {
    return {
      report: true,
      agentId: declared.id,
      agentVersion: detectAgentVersion(env, declared.id),
      surface,
      confidence: 'declared',
      sessionVar: declared.sessionVar,
    };
  }

  const detectedBy = detectUnknownHarness(env);

  if (detectedBy) {
    return {
      report: true,
      agentId: 'unknown',
      agentDetectedBy: detectedBy,
      surface,
      confidence: 'declared',
    };
  }

  // This path exists for harnesses that strip their environment before
  // invoking the CLI, and those never attach a terminal. Gating on that makes
  // "someone sitting at a terminal is never reported as an agent" a guarantee
  // rather than a likelihood, however unusual the rest of their environment
  // looks — a `cat` pager and a local debug proxy are a developer, not a
  // container.
  const weight = scan.headless.includes(NO_TTY_SIGNAL) ? scan.headless.length + scan.sandbox.length : 0;

  if (weight >= HEURISTIC_THRESHOLD) {
    return {
      report: true,
      agentId: 'unknown',
      surface,
      confidence: 'heuristic',
    };
  }

  return { report: true, surface, confidence: 'none' };
}

/**
 * Whether this is a build server. Reuses the CLI's existing variable list
 * rather than a copy of it, so the gate can't drift from `isInteractive()`.
 */
export function isCI(env: NodeJS.ProcessEnv): boolean {
  return CI_ENVIRONMENT_VARIABLES.some((name) => Boolean(env[name]));
}

/**
 * Whether something other than a person invoked the CLI. True for an
 * unrecognised harness as well as a named one — both mean there is nobody
 * waiting on the terminal.
 */
export function isAgentDriven(runContext: RunContext): boolean {
  return Boolean(runContext.agentId);
}

function readStreamStates(): StreamStates {
  const { stdin, stdout, stderr } = process;

  return {
    tty: [Boolean(stdin.isTTY), Boolean(stdout.isTTY), Boolean(stderr.isTTY)],
    socket: [isPipe(stdin), isPipe(stdout), isPipe(stderr)],
  };
}

/**
 * `tty.ReadStream` extends `net.Socket`, so a real terminal has to be excluded
 * rather than just testing the prototype.
 */
function isPipe(stream: NodeJS.ReadStream | NodeJS.WriteStream): boolean {
  return stream instanceof Socket && !stream.isTTY;
}
