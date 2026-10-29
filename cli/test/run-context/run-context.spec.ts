import { detectRunContext, isAgentDriven } from '../../src/run-context';

import { ATTACHED, CWD, EXEC_PATH, FIXTURES, PIPED } from './fixtures';

/**
 * Adding a harness to the registry has to leave every row below unchanged. A
 * row that moves means the new entry captured a run that already had an owner.
 */
describe('detectRunContext', () => {
  for (const { name, env, streams, cwd, execPath, expected } of FIXTURES) {
    it(`classifies ${name}`, () => {
      expect(detectRunContext({ env, streams, cwd, execPath })).toEqual(expected);
    });
  }

  it('reads the real environment when given no options', () => {
    const context = detectRunContext();

    expect(context).toHaveProperty('report');
    expect(context).toHaveProperty('surface');
    expect(context).toHaveProperty('confidence');
  });

  it('classifies an empty environment as a human run', () => {
    expect(detectRunContext({ env: {}, streams: ATTACHED, cwd: CWD, execPath: EXEC_PATH })).toEqual({
      report: true,
      surface: 'terminal',
      confidence: 'none',
    });
  });

  /**
   * One unlisted `*_SESSION_ID` is enough to match the convention rule, which
   * returns `declared` confidence. Without the terminal gate it would label
   * the developer who set it as an agent.
   */
  it('does not report an unlisted convention variable at an attached terminal', () => {
    const env = { GNOME_DESKTOP_SESSION_ID: 'this-is-deprecated', TERM: 'xterm-256color', USER: 'joey' };

    expect(detectRunContext({ env, streams: ATTACHED, cwd: CWD, execPath: EXEC_PATH })).toEqual({
      report: true,
      surface: 'terminal',
      confidence: 'none',
    });
  });

  it('still reports the same variable once no terminal is attached', () => {
    const env = { GNOME_DESKTOP_SESSION_ID: 'this-is-deprecated', TERM: 'xterm-256color', USER: 'joey' };

    expect(detectRunContext({ env, streams: PIPED, cwd: CWD, execPath: EXEC_PATH })).toEqual({
      report: true,
      agentId: 'unknown',
      agentDetectedBy: 'GNOME_DESKTOP_SESSION_ID',
      surface: 'terminal',
      confidence: 'declared',
    });
  });
});

describe('isAgentDriven', () => {
  for (const { name, env, streams, cwd, execPath, expected } of FIXTURES) {
    it(`agrees with the verdict for ${name}`, () => {
      expect(isAgentDriven(detectRunContext({ env, streams, cwd, execPath }))).toBe(Boolean(expected.agentId));
    });
  }

  it('is true for an unrecognised harness, not just a named one', () => {
    const context = detectRunContext({
      env: { NEWTOOL_SESSION_ID: 'nt_1' },
      streams: { tty: [false, false, false], socket: [true, true, true] },
      cwd: CWD,
      execPath: EXEC_PATH,
    });

    expect(context.agentId).toBe('unknown');
    expect(isAgentDriven(context)).toBe(true);
  });
});
