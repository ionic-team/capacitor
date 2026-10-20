import { detectRunContext } from '../../src/run-context';

import { ATTACHED, CWD, EXEC_PATH, FIXTURES } from './fixtures';

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
});
