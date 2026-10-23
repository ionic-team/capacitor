import type { Config } from '../src/definitions';
import { deliver, send } from '../src/ipc';
import type { RunContext } from '../src/run-context';
import {
  getProjectIdentity,
  isTelemetryDisabledByEnv,
  isTelemetryEnabled,
  runContextFields,
  sendMetric,
} from '../src/telemetry';
import { getCommandOutput } from '../src/util/subprocess';

jest.mock('../src/util/subprocess', () => ({ getCommandOutput: jest.fn() }));
jest.mock('../src/ipc', () => ({ deliver: jest.fn(), send: jest.fn() }));

const mockedGetCommandOutput = getCommandOutput as unknown as jest.Mock;
const mockedDeliver = deliver as unknown as jest.Mock;
const mockedSend = send as unknown as jest.Mock;

function context(overrides: Partial<RunContext> = {}): RunContext {
  return { report: true, surface: 'terminal', confidence: 'none', ...overrides };
}

function makeConfig(): Config {
  return { app: { rootDir: '/app' } } as unknown as Config;
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

describe('sendMetric', () => {
  const sysconfig = { machine: 'machine-1', telemetry: true };

  beforeEach(() => {
    mockedDeliver.mockReset().mockResolvedValue(undefined);
    mockedSend.mockReset().mockResolvedValue(undefined);
  });

  /**
   * A developer's machine outlives the command, so delivery is detached and
   * forgotten. An agent sandbox usually isn't around long enough for that to
   * finish, so those runs wait on it instead.
   */
  it('hands a human run to the detached sender', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context());

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedDeliver).not.toHaveBeenCalled();
  });

  it('awaits delivery for an agent-driven run', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context({ agentId: 'claude-code' }));

    expect(mockedDeliver).toHaveBeenCalledTimes(1);
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('awaits delivery for an unrecognised harness too', async () => {
    await sendMetric(sysconfig, 'capacitor_cli_command', {}, context({ agentId: 'unknown' }));

    expect(mockedDeliver).toHaveBeenCalledTimes(1);
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
  beforeEach(() => {
    mockedGetCommandOutput.mockReset();
  });

  it('keys on the repository first commit when there is one', async () => {
    mockedGetCommandOutput.mockResolvedValueOnce('9f8c1a2b4d5e6f708192a3b4c5d6e7f801234567\n');

    const identity = await getProjectIdentity(makeConfig(), context(), {});

    expect(identity.project_id_source).toBe('repository');
    expect(identity.project_id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('falls back to the agent session when the project has no commit', async () => {
    mockedGetCommandOutput.mockResolvedValueOnce(null);

    const identity = await getProjectIdentity(makeConfig(), context({ sessionVar: 'CLAUDE_CODE_SESSION_ID' }), {
      CLAUDE_CODE_SESSION_ID: 'session-secret-value',
    });

    expect(identity.project_id_source).toBe('session');
    expect(identity.project_id).toMatch(/^[0-9a-f]{16}$/);
    expect(identity.project_id).not.toBe('session-secret-value');
    expect(identity.project_id).not.toContain('session');
  });

  it('reports no identifier when neither source is available', async () => {
    mockedGetCommandOutput.mockResolvedValueOnce(null);

    expect(await getProjectIdentity(makeConfig(), context(), {})).toEqual({
      project_id: null,
      project_id_source: 'none',
    });
  });

  it('reports no identifier when the session variable is named but unset', async () => {
    mockedGetCommandOutput.mockResolvedValueOnce(null);

    const identity = await getProjectIdentity(makeConfig(), context({ sessionVar: 'CLAUDE_CODE_SESSION_ID' }), {});

    expect(identity.project_id_source).toBe('none');
  });

  it('is deterministic, so repeated runs collapse to one project', async () => {
    mockedGetCommandOutput.mockResolvedValue('9f8c1a2b4d5e6f708192a3b4c5d6e7f801234567');

    const first = await getProjectIdentity(makeConfig(), context(), {});
    const second = await getProjectIdentity(makeConfig(), context(), {});

    expect(first.project_id).toBe(second.project_id);
  });

  it('gives different projects different identifiers', async () => {
    mockedGetCommandOutput.mockResolvedValueOnce('1111111111111111111111111111111111111111');
    const first = await getProjectIdentity(makeConfig(), context(), {});

    mockedGetCommandOutput.mockResolvedValueOnce('2222222222222222222222222222222222222222');
    const second = await getProjectIdentity(makeConfig(), context(), {});

    expect(first.project_id).not.toBe(second.project_id);
  });
});
