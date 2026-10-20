import type { StreamStates, Surface } from './types';

export interface SignalScan {
  /** Evidence that a machine rather than a person is driving the process. */
  readonly headless: readonly string[];
  /** Traces of an agent-managed container. */
  readonly sandbox: readonly string[];
}

/**
 * Variables whose value is a proxy target. The `_PORT` spelling is how hosted
 * Claude Code sandboxes expose theirs.
 */
const PROXY_VARIABLE_PATTERN = /_PROXY$|_PROXY_PORT$|^(?:HTTP|HTTPS|ALL)_PROXY$/;

const LOOPBACK_PATTERN = /(?:^|\/\/|@)(?:127\.0\.0\.1|localhost|\[::1\]|0\.0\.0\.0)(?::\d+)?(?:$|[/?])/i;

/**
 * Some hosted sandboxes mint an adjective-adjective-surname username per
 * session. Inferred from observed sandboxes, not documented by any vendor —
 * which is why it only ever contributes to a heuristic verdict.
 */
const GENERATED_USERNAME_PATTERN = /^[a-z]+[-_][a-z]+[-_][a-z]+$/;

/** A session-scoped mount carries a generated id in its path. Also inferred. */
const SESSION_MOUNT_PATTERN = /[/\\](?:sessions?|workspaces?)[/\\][0-9a-f][0-9a-f-]{7,}/i;

const JAVA_AGENT_PATTERN = /-javaagent/i;

const JETBRAINS_TERMINAL_PATTERN = /jetbrains/i;

export function scanSignals(env: NodeJS.ProcessEnv, streams: StreamStates, cwd: string, execPath: string): SignalScan {
  return {
    headless: scanHeadless(env, streams),
    sandbox: scanSandbox(env, cwd, execPath),
  };
}

/**
 * Derive the execution environment, most specific match first. Independent of
 * the agent verdict by design, so a terminal agent and an IDE agent are
 * distinguishable downstream.
 */
export function deriveSurface(env: NodeJS.ProcessEnv, scan: SignalScan): Surface {
  if (scan.sandbox.length > 0) {
    return 'cloud-sandbox';
  }

  if (isDesktopShell(env)) {
    return 'desktop-app';
  }

  if (isIde(env)) {
    return 'ide';
  }

  return 'terminal';
}

function scanHeadless(env: NodeJS.ProcessEnv, streams: StreamStates): string[] {
  const signals: string[] = [];

  if (!streams.tty.some(Boolean)) {
    signals.push('no-tty');
  }

  if (streams.socket.some(Boolean)) {
    signals.push('stream-socket');
  }

  // A human wouldn't set contradictory color rules; a wrapper assembling an
  // environment from defaults does.
  if (env.NO_COLOR && env.CLICOLOR_FORCE) {
    signals.push('contradictory-color');
  }

  if (env.PAGER === 'cat' || env.GIT_PAGER === 'cat' || env.GIT_EDITOR === 'true') {
    signals.push('pager-disabled');
  }

  if (isDesktopShell(env)) {
    signals.push('gui-bundle-no-term');
  }

  return signals;
}

function scanSandbox(env: NodeJS.ProcessEnv, cwd: string, execPath: string): string[] {
  const signals: string[] = [];

  if (countLoopbackProxies(env) >= 3) {
    signals.push('loopback-proxies');
  }

  if (env.SANDBOX_RUNTIME) {
    signals.push('sandbox-runtime');
  }

  if (env.JAVA_TOOL_OPTIONS && JAVA_AGENT_PATTERN.test(env.JAVA_TOOL_OPTIONS)) {
    signals.push('java-tool-options-agent');
  }

  if (GENERATED_USERNAME_PATTERN.test(env.USER ?? env.USERNAME ?? '')) {
    signals.push('generated-username');
  }

  if (SESSION_MOUNT_PATTERN.test(cwd) || SESSION_MOUNT_PATTERN.test(execPath)) {
    signals.push('session-mount');
  }

  return signals;
}

function countLoopbackProxies(env: NodeJS.ProcessEnv): number {
  return Object.entries(env).filter(([name, value]) => {
    const normalized = name.toUpperCase();

    if (!value || !PROXY_VARIABLE_PATTERN.test(normalized)) {
      return false;
    }

    // A bare port is only ever a local one, so `*_PROXY_PORT` needs no host.
    return normalized.endsWith('_PORT') ? /^\d+$/.test(value) : LOOPBACK_PATTERN.test(value);
  }).length;
}

/**
 * A GUI application spawned a bare shell. Shared by the headless scan and the
 * surface derivation so the two can't drift apart.
 */
function isDesktopShell(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.__CFBundleIdentifier || env.ELECTRON_RUN_AS_NODE) && !env.TERM;
}

function isIde(env: NodeJS.ProcessEnv): boolean {
  return Boolean(
    env.VSCODE_PID ||
    env.VSCODE_GIT_ASKPASS_NODE ||
    env.JETBRAINS_IDE ||
    env.TERM_PROGRAM === 'vscode' ||
    JETBRAINS_TERMINAL_PATTERN.test(env.TERMINAL_EMULATOR ?? ''),
  );
}
