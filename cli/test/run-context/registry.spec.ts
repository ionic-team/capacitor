import { defaultAgents } from 'agent-cli-detector';

import { AGENT_OVERRIDES, capacitorAgents, overrideFor } from '../../src/run-context/registry';

describe('agent registry', () => {
  /**
   * Our additions are keyed by the published registry's own agent ids. A rename
   * or removal upstream would make them silently stop applying, taking
   * Capacitor's detection of its own vendors with it — so fail here, naming the
   * stale key, rather than through a confusing fixture mismatch.
   */
  it('only overrides agents the published registry still lists', () => {
    const published = new Set(defaultAgents.map((agent) => agent.id));
    const stale = Object.keys(AGENT_OVERRIDES).filter((id) => !published.has(id));

    expect(stale).toEqual([]);
  });

  it('appends our signals without dropping the published ones', () => {
    const upstream = defaultAgents.find((agent) => agent.id === 'claude-code');
    const merged = capacitorAgents.find((agent) => agent.id === 'claude-code');
    const names = merged?.env?.map((signal) => signal.name) ?? [];

    expect(names).toEqual(expect.arrayContaining(upstream?.env?.map((signal) => signal.name) ?? []));
    expect(names).toEqual(expect.arrayContaining(['CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_TMPDIR']));
  });

  it('leaves agents with no override untouched', () => {
    expect(overrideFor('cursor')).toBeUndefined();
    expect(capacitorAgents.find((agent) => agent.id === 'cursor')).toBe(
      defaultAgents.find((agent) => agent.id === 'cursor'),
    );
  });
});
