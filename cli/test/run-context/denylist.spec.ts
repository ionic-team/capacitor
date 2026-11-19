import { CONVENTION_DENYLIST, CONVENTION_PATTERN, detectRunContext } from '../../src/run-context';
import { detectUnknownHarness } from '../../src/run-context/unknown';

import { ATTACHED, CWD, EXEC_PATH } from './fixtures';

/**
 * The most important tests in the detector. Every entry here is a variable a
 * real terminal, shell or credential agent sets; miss one and every macOS or
 * Linux user is labelled an agent.
 */
describe('convention denylist', () => {
  it('covers every known non-agent variable that follows the convention', () => {
    expect([...CONVENTION_DENYLIST].sort()).toEqual([
      'GPG_AGENT',
      'HTTP_USER_AGENT',
      'ITERM_SESSION_ID',
      'SSH_AGENT',
      'SSH_SESSION_ID',
      'TERM_SESSION_ID',
      'USER_AGENT',
      'XDG_SESSION_ID',
    ]);
  });

  for (const name of CONVENTION_DENYLIST) {
    describe(name, () => {
      // If an entry stops matching the convention pattern it has become dead
      // code, and a future regex change could silently un-exclude it.
      it('matches the convention pattern, so the entry is load-bearing', () => {
        expect(CONVENTION_PATTERN.test(name)).toBe(true);
      });

      it('is not reported as an unknown harness', () => {
        expect(detectUnknownHarness({ [name]: 'some-value', TERM: 'xterm' })).toBeUndefined();
      });

      it('does not make a human run look agent-driven', () => {
        const context = detectRunContext({
          env: { [name]: 'some-value', TERM: 'xterm', USER: 'joey' },
          streams: ATTACHED,
          cwd: CWD,
          execPath: EXEC_PATH,
        });

        expect(context.agentId).toBeUndefined();
        expect(context.confidence).toBe('none');
      });

      it('is excluded case-insensitively', () => {
        expect(detectUnknownHarness({ [name.toLowerCase()]: 'some-value' })).toBeUndefined();
      });
    });
  }

  it('still reports a harness that only resembles a denylisted name', () => {
    expect(detectUnknownHarness({ NEWTOOL_SESSION_ID: 'x' })).toBe('NEWTOOL_SESSION_ID');
    expect(detectUnknownHarness({ MYTERM_SESSION_ID: 'x' })).toBe('MYTERM_SESSION_ID');
  });

  it('ignores names that only share a prefix with a denylisted one', () => {
    expect(detectUnknownHarness({ GPG_AGENT_INFO: 'x', SSH_AUTH_SOCK: 'y' })).toBeUndefined();
  });
});
