/**
 * Where the CLI is running, derived independently of which agent (if any) is
 * driving it, so the two can be sliced apart downstream.
 */
export type Surface = 'terminal' | 'ide' | 'desktop-app' | 'cloud-sandbox';

/**
 * How the verdict was reached. `declared` is an explicit vendor signal;
 * `heuristic` is the combined weight of indirect ones.
 */
export type Confidence = 'declared' | 'heuristic' | 'none';

export interface RunContext {
  /**
   * Whether this invocation may be reported at all. False for CI, which is
   * still classified but never delivered.
   */
  readonly report: boolean;

  /**
   * Registry id of the harness, or `unknown` when something agent-shaped was
   * detected but not recognized. Absent when no agent was detected.
   */
  readonly agentId?: string;

  /**
   * Semver string, or `unknown` when no source carried a valid one. Absent
   * when no agent was detected.
   */
  readonly agentVersion?: string;

  /**
   * Name of the environment variable that matched the convention rule. Present
   * only when `agentId` is `unknown`, and never a value.
   */
  readonly agentDetectedBy?: string;

  readonly surface: Surface;

  readonly confidence: Confidence;

  /**
   * Name of the harness's session variable, when it sets one. Callers hash the
   * value to key `project_id`; the value never enters this object.
   */
  readonly sessionVar?: string;
}

/**
 * Terminal state of stdin, stdout and stderr, in that order. Passed in rather
 * than read, so fixtures can drive detection.
 */
export interface StreamStates {
  readonly tty: readonly [boolean, boolean, boolean];
  readonly socket: readonly [boolean, boolean, boolean];
}

export interface DetectRunContextOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly streams?: StreamStates;
  readonly cwd?: string;
  readonly execPath?: string;
}
