import { EnvironmentDetectionStrategy } from 'agent-cli-detector';

import { capacitorAgents } from './registry';

export interface DeclaredMatch {
  readonly id: string;
  readonly sessionVar?: string;
}

const strategy = new EnvironmentDetectionStrategy();

/**
 * Identify a registered harness from the variables it sets to announce itself.
 *
 * Driven through the strategy rather than the package's `detectAgent()` because
 * that reduces to a bare `{ detected, agent }` and discards which variable
 * matched — which callers need in order to report an unrecognised harness.
 *
 * Only the agent id and the session variable's *name* leave this function. The
 * evidence also carries each matched variable's live value, and some of those
 * hold access tokens, so nothing else from it is propagated.
 */
export function detectDeclared(env: NodeJS.ProcessEnv): DeclaredMatch | undefined {
  // `pid` and `maxProcessDepth` are required by the context type but unread by
  // the environment strategy. Walking the process tree needs a subprocess call
  // with no portable Windows equivalent, so this path stays environment-only.
  const evidence = strategy.detect({
    env,
    agents: capacitorAgents,
    pid: 0,
    maxProcessDepth: 0,
  });

  if (evidence.length === 0) {
    return undefined;
  }

  const matchCounts = new Map<string, number>();

  for (const { agent } of evidence) {
    matchCounts.set(agent.id, (matchCounts.get(agent.id) ?? 0) + 1);
  }

  // One environment can satisfy several harnesses at once — an agent CLI run
  // from inside another vendor's terminal declares both. Most matched signals
  // wins; Map iteration preserves registry order, so ties resolve the same way
  // on every platform instead of depending on `Object.keys(env)`.
  let winner = '';
  let best = 0;

  for (const [id, count] of matchCounts) {
    if (count > best) {
      winner = id;
      best = count;
    }
  }

  const definition = capacitorAgents.find((agent) => agent.id === winner);

  return {
    id: winner,
    sessionVar: definition?.sessionEnv?.find((name) => env[name]),
  };
}
