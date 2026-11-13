import { detectRunContext } from '../../src/run-context';
import type { RunContext } from '../../src/run-context';
import { AGENT_OVERRIDES } from '../../src/run-context/registry';
import type { AgentOverride } from '../../src/run-context/registry';

import { CWD, EXEC_PATH, FIXTURES, PIPED } from './fixtures';

// `Object.values` over a `Partial<Record<...>>` of literal keys widens to
// `any[]`, so annotate before mapping or the lookup below is unchecked.
const overrides: AgentOverride[] = Object.values(AGENT_OVERRIDES);

/**
 * The one carve-out: a harness version is read out of a variable and is meant
 * to be reported. Built from the registry rather than hand-listed, so adding a
 * version source can't silently widen what may be transmitted.
 */
const VERSION_VARIABLES = new Set(['AI_AGENT', ...overrides.map((override) => override.versionVariable)]);

function run(env: NodeJS.ProcessEnv): RunContext {
  return detectRunContext({ env, streams: PIPED, cwd: CWD, execPath: EXEC_PATH });
}

function stringsIn(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(stringsIn);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(stringsIn);
  }

  return [];
}

/**
 * No detection variable's value may reach a reported field — some of them hold
 * access tokens.
 *
 * Asserted on the public return value rather than on any internal, so a field
 * added later is covered without touching this file.
 */
describe('no environment variable values reach the run context', () => {
  for (const { name, env, streams, cwd, execPath } of FIXTURES) {
    it(`leaks nothing from ${name}`, () => {
      const reported = stringsIn(detectRunContext({ env, streams, cwd, execPath }));

      for (const [variable, value] of Object.entries(env)) {
        if (typeof value !== 'string' || VERSION_VARIABLES.has(variable)) {
          continue;
        }

        expect(reported).not.toContain(value);
      }
    });
  }

  it('lets a version variable reach agentVersion and nothing else', () => {
    const context = run({ CODEX_THREAD_ID: 'th_1', CODEX_VERSION: '0.47.0', TERM: 'xterm' });

    expect(context.agentVersion).toBe('0.47.0');
    expect(stringsIn({ ...context, agentVersion: undefined })).not.toContain('0.47.0');
  });

  it('reports the variable name but never its value for an unknown harness', () => {
    const context = run({ NEWTOOL_SESSION_ID: 'sk-live-do-not-leak-me', TERM: 'xterm' });

    expect(context.agentDetectedBy).toBe('NEWTOOL_SESSION_ID');
    expect(stringsIn(context)).not.toContain('sk-live-do-not-leak-me');
  });

  it('reports the session variable name but never its value', () => {
    const context = run({
      CLAUDECODE: '1',
      CLAUDE_CODE_SESSION_ID: 'session-secret-value',
      TERM: 'xterm',
    });

    expect(context.sessionVar).toBe('CLAUDE_CODE_SESSION_ID');
    expect(stringsIn(context)).not.toContain('session-secret-value');
  });
});
