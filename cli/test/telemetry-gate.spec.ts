import { deliver, send } from '../src/ipc';
import type { RunContext } from '../src/run-context';
import {
  getProjectIdentity,
  isTelemetryDisabledByEnv,
  isTelemetryEnabled,
  needsAwaitedDelivery,
  runContextFields,
  sendMetric,
} from '../src/telemetry';

jest.mock('../src/ipc', () => ({ deliver: jest.fn(), send: jest.fn() }));

const mockedDeliver = deliver as unknown as jest.Mock;
const mockedSend = send as unknown as jest.Mock;

const COMMIT = '9f8c1a2b4d5e6f708192a3b4c5d6e7f801234567';

function context(overrides: Partial<RunContext> = {}): RunContext {
  return { report: true, surface: 'terminal', confidence: 'none', ...overrides };
}

describe('isTelemetryDisabledByEnv', () => {
  it('is true for any non-empty value', () => {
    expect(isTelemetryDisabledByEnv({ CAP_TELEMETRY_DISABLED: '1' })).toBe(true);
    expect(isTelemetryDisabledByEnv({ CAP_TELEMETRY_DISABLED: 'true' })).toBe(true);
    expect(isTelemetryDisabledByEnv({ CAP_TELEMETRY_DISABLED: 'no' })).toBe(true);
  });

  it('is false when unset or empty', () => {
    expect(isTelemetryDisabledByEnv({})).toBe(false);
    expect(isTelemetryDisabledByEnv({ CAP_TELEMETRY_DISABLED: '' })).toBe(false);
  });
});

describe('isTelemetryEnabled', () => {
  const agent = context({ agentId: 'claude-code', confidence: 'declared' });

  it('respects an explicit opt-in and opt-out', () => {
    expect(isTelemetryEnabled({}, { telemetry: true }, context())).toBe(true);
    expect(isTelemetryEnabled({}, { telemetry: false }, context())).toBe(false);
  });

  /**
   * An explicit choice is a choice wherever it was made, so a stored opt-in
   * still counts on a run with no terminal attached.
   */
  it('honours a stored opt-in on a run with nobody watching', () => {
    expect(isTelemetryEnabled({}, { telemetry: true }, agent)).toBe(true);
    expect(isTelemetryEnabled({}, { telemetry: false }, agent)).toBe(false);
  });

  /**
   * Only the interactive path ever writes the default, and an agent sandbox
   * never reaches it — reading an unset value as "no" there would drop the
   * entire population this feature exists to report on.
   */
  it('treats unset consent as enabled for an agent-driven run', () => {
    expect(isTelemetryEnabled({}, {}, agent)).toBe(true);
    expect(isTelemetryEnabled({}, {}, context({ agentId: 'unknown', confidence: 'heuristic' }))).toBe(true);
  });

  /**
   * The notice is only ever printed at a terminal. A first run inside a Docker
   * build, a git hook or `cap sync | tee` has had no chance to show it, so
   * reporting from there would put the data ahead of the disclosure.
   */
  it('treats unset consent as disabled when no agent is behind the run', () => {
    expect(isTelemetryEnabled({}, {}, context())).toBe(false);
  });

  it('is false on CI even with consent stored', () => {
    expect(isTelemetryEnabled({}, { telemetry: true }, context({ report: false }))).toBe(false);
  });

  it('is false when the opt-out variable is set, whatever else says', () => {
    const env = { CAP_TELEMETRY_DISABLED: '1' };

    expect(isTelemetryEnabled(env, { telemetry: true }, context())).toBe(false);
    expect(isTelemetryEnabled(env, {}, agent)).toBe(false);
  });
});

describe('runContextFields', () => {
  it('reports only surface and confidence when no agent was detected', () => {
    expect(runContextFields(context())).toEqual({ surface: 'terminal', confidence: 'none' });
  });

  it('reports every agent field when all are known', () => {
    expect(
      runContextFields(
        context({
          agentId: 'claude-code',
          agentVersion: '2.1.236',
          confidence: 'declared',
          sessionVar: 'CLAUDE_CODE_SESSION_ID',
        }),
      ),
    ).toEqual({
      surface: 'terminal',
      confidence: 'declared',
      agent_id: 'claude-code',
      agent_version: '2.1.236',
    });
  });

  it('omits the version for an unrecognised harness rather than nulling it', () => {
    const fields = runContextFields(
      context({ agentId: 'unknown', agentDetectedBy: 'NEWTOOL_SESSION_ID', confidence: 'declared' }),
    );

    expect(fields).toEqual({
      surface: 'terminal',
      confidence: 'declared',
      agent_id: 'unknown',
      agent_detected_by: 'NEWTOOL_SESSION_ID',
    });
    expect('agent_version' in fields).toBe(false);
  });

  it('never carries the session variable through to the payload', () => {
    const fields = runContextFields(context({ agentId: 'codex', sessionVar: 'CODEX_THREAD_ID' }));

    expect(Object.values(fields)).not.toContain('CODEX_THREAD_ID');
  });
});

/**
 * The forked sender is not `detached` and has to cold-start Node before it can
 * reach the network, so only an environment that disappears when the CLI
 * returns needs the request made in-process.
 */
describe('needsAwaitedDelivery', () => {
  const sandbox = { surface: 'cloud-sandbox' } as const;

  it('is true for an agent in a disposable sandbox', () => {
    expect(needsAwaitedDelivery(context({ ...sandbox, agentId: 'claude-code', confidence: 'declared' }))).toBe(true);
    expect(needsAwaitedDelivery(context({ ...sandbox, agentId: 'unknown', confidence: 'heuristic' }))).toBe(true);
  });

  it('is false for a named agent on a machine that outlives the command', () => {
    expect(needsAwaitedDelivery(context({ agentId: 'claude-code', confidence: 'declared' }))).toBe(false);
    expect(needsAwaitedDelivery(context({ agentId: 'claude-code', confidence: 'declared', surface: 'ide' }))).toBe(
      false,
    );
  });

  /**
   * The sandbox surface fires on a developer running a local debug proxy, so
   * on its own it is not evidence of anything disposable.
   */
  it('is false for a sandbox-shaped environment with no agent behind it', () => {
    expect(needsAwaitedDelivery(context(sandbox))).toBe(false);
  });

  it('is false for a human run', () => {
    expect(needsAwaitedDelivery(context())).toBe(false);
  });
});

describe('sendMetric', () => {
  const sysconfig = { machine: 'machine-1', telemetry: true };

  beforeEach(() => {
    mockedDeliver.mockReset().mockResolvedValue(undefined);
    mockedSend.mockReset().mockResolvedValue(undefined);
  });

  it('hands a human run to the detached sender', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context());

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedDeliver).not.toHaveBeenCalled();
  });

  it('awaits delivery for an agent in a disposable sandbox', async () => {
    const runContext = context({ agentId: 'claude-code', surface: 'cloud-sandbox', confidence: 'declared' });

    await sendMetric(sysconfig, 'capacitor_cli_command', {}, runContext);

    expect(mockedDeliver).toHaveBeenCalledTimes(1);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('detaches for an agent on a developer machine, like a human run', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context({ agentId: 'claude-code' }));

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedDeliver).not.toHaveBeenCalled();
  });

  it('sends nothing at all when telemetry is off', async () => {
    await sendMetric({ ...sysconfig, telemetry: false }, 'capacitor_cli_command', {}, context());

    expect(mockedSend).not.toHaveBeenCalled();
    expect(mockedDeliver).not.toHaveBeenCalled();
  });

  it('sends nothing for a non-agent run that has never been shown the notice', async () => {
    await sendMetric({ machine: 'machine-1' }, 'capacitor_cli_command', {}, context());

    expect(mockedSend).not.toHaveBeenCalled();
    expect(mockedDeliver).not.toHaveBeenCalled();
  });

  it('sends nothing on CI', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context({ report: false, agentId: 'claude-code' }));

    expect(mockedSend).not.toHaveBeenCalled();
    expect(mockedDeliver).not.toHaveBeenCalled();
  });
});

describe('getProjectIdentity', () => {
  it('keys on the repository first commit when there is one', async () => {
    const identity = await getProjectIdentity(COMMIT, context(), {});

    expect(identity.project_id_source).toBe('repository');
    expect(identity.project_id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('falls back to the agent session when the project has no commit', async () => {
    const identity = await getProjectIdentity(undefined, context({ sessionVar: 'CLAUDE_CODE_SESSION_ID' }), {
      CLAUDE_CODE_SESSION_ID: 'session-secret-value',
    });

    expect(identity.project_id_source).toBe('session');
    expect(identity.project_id).toMatch(/^[0-9a-f]{16}$/);
    expect(identity.project_id).not.toBe('session-secret-value');
    expect(identity.project_id).not.toContain('session');
  });

  it('reports no identifier when neither source is available', async () => {
    expect(await getProjectIdentity(undefined, context(), {})).toEqual({
      project_id: null,
      project_id_source: 'none',
    });
  });

  it('reports no identifier when the session variable is named but unset', async () => {
    const identity = await getProjectIdentity(undefined, context({ sessionVar: 'CLAUDE_CODE_SESSION_ID' }), {});

    expect(identity.project_id_source).toBe('none');
  });

  it('is deterministic, so repeated runs collapse to one project', async () => {
    const first = await getProjectIdentity(COMMIT, context(), {});
    const second = await getProjectIdentity(COMMIT, context(), {});

    expect(first.project_id).toBe(second.project_id);
  });

  it('gives different projects different identifiers', async () => {
    const first = await getProjectIdentity('1111111111111111111111111111111111111111', context(), {});
    const second = await getProjectIdentity('2222222222222222222222222222222222222222', context(), {});

    expect(first.project_id).not.toBe(second.project_id);
  });
});
