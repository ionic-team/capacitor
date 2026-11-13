/**
 * Agent harnesses name their declaring variables consistently, so one missing
 * from the registry can still be noticed by shape alone. A name that shows up
 * across many projects is the signal to register the vendor properly.
 */
export const CONVENTION_PATTERN = /^[A-Z0-9_]+_(AGENT|TOOL_USE_ID|SESSION_ID|THREAD_ID|CONVERSATION_ID|TRAJECTORY_ID)$/;

/**
 * Non-agent tools that follow the same convention. Terminals, SSH and GPG all
 * mint session identifiers of their own. Tested one entry at a time.
 *
 * The caller only consults this rule for a run with no terminal attached, so a
 * name missing here can only affect a headless run.
 */
export const CONVENTION_DENYLIST: readonly string[] = [
  'TERM_SESSION_ID',
  'ITERM_SESSION_ID',
  'SSH_SESSION_ID',
  'XDG_SESSION_ID',
  'USER_AGENT',
  'HTTP_USER_AGENT',
  'GPG_AGENT',
  'SSH_AGENT',
];

/**
 * Return the name of the first variable that looks like an unregistered
 * harness, or undefined. Names are sorted so the result doesn't depend on
 * environment insertion order.
 */
export function detectUnknownHarness(env: NodeJS.ProcessEnv): string | undefined {
  for (const name of Object.keys(env).sort()) {
    // Windows environment variables are case-insensitive, so normalize before
    // both tests — otherwise a denylisted name in mixed case slips through.
    const normalized = name.toUpperCase();

    if (CONVENTION_DENYLIST.includes(normalized)) {
      continue;
    }

    if (CONVENTION_PATTERN.test(normalized)) {
      return name;
    }
  }

  return undefined;
}
