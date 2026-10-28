import { defaultAgents } from 'agent-cli-detector';
import type { AgentDefinition, AgentId, EnvSignal } from 'agent-cli-detector';

export interface AgentOverride {
  /** Declaring variables the published registry doesn't carry. */
  readonly env?: readonly EnvSignal[];
  /** Where this harness puts its own version, when `AI_AGENT` isn't set. */
  readonly versionVariable?: string;
  /** Whether that variable holds a JSON document rather than a bare version. */
  readonly versionIsJson?: boolean;
}

/**
 * Capacitor's additions to the published registry, keyed by the upstream agent
 * id. `agent-cli-detector@0.1.7` matches Codex only through its sandbox
 * markers, knows none of Claude Code's entrypoint or hosted-sandbox variables,
 * and carries no version information for anyone.
 *
 * Keying against the package's own id union means a rename or removal upstream
 * fails to compile instead of silently dropping the entry. It also means this
 * map can only extend a harness the package already lists; a vendor it has
 * never heard of needs an upstream addition first.
 *
 * Re-verify the version variables before every release — vendors rename them
 * between versions.
 *
 * Claude Code's `CLAUDE_CODE_HOST_*_PROXY_PORT` variables are deliberately
 * absent: a wildcard can't be expressed as an `EnvSignal.name`, and they are
 * loopback proxy markers, so `signals.ts` matches them instead.
 */
export const AGENT_OVERRIDES: Partial<Record<AgentId, AgentOverride>> = {
  antigravity: { versionVariable: 'ANTIGRAVITY_LS_VERSION' },
  'claude-code': { env: [{ name: 'CLAUDE_CODE_ENTRYPOINT' }, { name: 'CLAUDE_TMPDIR' }] },
  codex: {
    env: [{ name: 'CODEX_VERSION' }, { name: 'CODEX_SANDBOX' }],
    versionVariable: 'CODEX_VERSION',
  },
  kilocode: { versionVariable: 'KILOCODE_VERSION' },
  muse: { versionVariable: 'MUSE_RELEASE_INFO', versionIsJson: true },
};

export function overrideFor(agentId: string): AgentOverride | undefined {
  return AGENT_OVERRIDES[agentId as AgentId];
}

/**
 * The published registry with Capacitor's additions layered on. Extending a
 * listed harness means editing `AGENT_OVERRIDES` and nothing else.
 */
export const capacitorAgents: readonly AgentDefinition[] = defaultAgents.map((agent) => {
  const extra = overrideFor(agent.id)?.env;

  return extra ? { ...agent, env: [...(agent.env ?? []), ...extra] } : agent;
});
