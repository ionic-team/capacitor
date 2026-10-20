import { valid } from 'semver';

import { overrideFor } from './registry';

/**
 * Several harnesses set `AI_AGENT` in a shared `<vendor>_<version>_agent`
 * format, with the version's dots written as dashes. It's the only
 * non-per-vendor source, so a harness adopting the convention is picked up
 * without a registry change.
 */
const AI_AGENT_PATTERN = /^[A-Za-z0-9-]+_(\d[\d-]*)_agent$/;

/**
 * A version-shaped segment in an installation path, e.g. a package cache
 * directory ending `.../claude-code/2.1.236/cli.js`.
 */
const PATH_VERSION_PATTERN = /(?:^|[/\\])v?(\d+\.\d+\.\d+(?:[-+][\w.]+)?)(?:[/\\]|$)/;

/**
 * Resolve the harness version from the first source that carries one.
 *
 * "First source" means first *present*, not first valid: a harness that sets
 * `AI_AGENT` to something malformed reports `unknown` rather than falling
 * through to a variable it never set.
 */
export function detectAgentVersion(env: NodeJS.ProcessEnv, agentId: string, execPath: string): string {
  const raw = fromAiAgent(env) ?? fromVendorVariable(env, agentId) ?? fromExecutablePath(execPath);

  return raw && valid(raw) ? raw : 'unknown';
}

function fromAiAgent(env: NodeJS.ProcessEnv): string | undefined {
  const value = env.AI_AGENT;

  if (!value) {
    return undefined;
  }

  const match = AI_AGENT_PATTERN.exec(value);

  // An unparseable value is still a hit — it gets rejected by semver below.
  return match ? match[1].replace(/-/g, '.') : value;
}

function fromVendorVariable(env: NodeJS.ProcessEnv, agentId: string): string | undefined {
  const override = overrideFor(agentId);

  if (!override?.versionVariable) {
    return undefined;
  }

  const value = env[override.versionVariable];

  if (!value) {
    return undefined;
  }

  return override.versionIsJson ? (fromJson(value) ?? value) : value;
}

function fromExecutablePath(execPath: string): string | undefined {
  return PATH_VERSION_PATTERN.exec(execPath)?.[1];
}

/**
 * Pull a version out of a JSON-valued vendor variable. The field name isn't
 * documented by any vendor we've seen, so the common spellings are tried and
 * anything else falls through to semver rejection.
 */
function fromJson(value: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== 'object' || parsed === null) {
      return undefined;
    }

    const record = parsed as Record<string, unknown>;

    for (const field of ['version', 'release', 'tag']) {
      if (typeof record[field] === 'string') {
        return record[field] as string;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}
