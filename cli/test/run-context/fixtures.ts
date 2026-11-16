import type { RunContext, StreamStates } from '../../src/run-context';

export interface RunContextFixture {
  readonly name: string;
  readonly env: NodeJS.ProcessEnv;
  readonly streams: StreamStates;
  readonly cwd: string;
  readonly execPath: string;
  readonly expected: RunContext;
}

/** A human at a terminal: every stream is a TTY. */
export const ATTACHED: StreamStates = {
  tty: [true, true, true],
  socket: [false, false, false],
};

/** A parent process reading the CLI's output through pipes. */
export const PIPED: StreamStates = {
  tty: [false, false, false],
  socket: [true, true, true],
};

export const CWD = '/Users/joey/app';
export const EXEC_PATH = '/usr/local/bin/node';

/** The verdict for any run with no agent behind it. */
const HUMAN: RunContext = { report: true, surface: 'terminal', confidence: 'none' };

function fixture(
  name: string,
  env: NodeJS.ProcessEnv,
  expected: RunContext,
  overrides: Partial<Pick<RunContextFixture, 'streams' | 'cwd' | 'execPath'>> = {},
): RunContextFixture {
  return {
    name,
    env,
    streams: PIPED,
    cwd: CWD,
    execPath: EXEC_PATH,
    ...overrides,
    expected,
  };
}

export const FIXTURES: readonly RunContextFixture[] = [
  fixture(
    'human-terminal',
    {
      HOME: '/Users/joey',
      PAGER: 'less',
      SHELL: '/bin/zsh',
      TERM: 'xterm-256color',
      TERM_SESSION_ID: 'w0t0p0:1B2C3D4E',
      USER: 'joey',
    },
    HUMAN,
    { streams: ATTACHED },
  ),

  fixture(
    'github-actions',
    { CI: 'true', GITHUB_ACTIONS: 'true', TERM: 'dumb' },
    {
      report: false,
      surface: 'terminal',
      confidence: 'none',
    },
  ),

  fixture(
    'claude-code-terminal',
    {
      AI_AGENT: 'claude-code_2-1-236_agent',
      CLAUDECODE: '1',
      CLAUDE_CODE_ENTRYPOINT: 'cli',
      CLAUDE_CODE_SESSION_ID: '9f8c1a2b-4d5e-6f70-8192-a3b4c5d6e7f8',
      TERM: 'xterm-256color',
      USER: 'joey',
    },
    {
      report: true,
      agentId: 'claude-code',
      agentVersion: '2.1.236',
      surface: 'terminal',
      confidence: 'declared',
      sessionVar: 'CLAUDE_CODE_SESSION_ID',
    },
  ),

  fixture(
    'claude-code-sandbox',
    {
      CLAUDECODE: '1',
      CLAUDE_CODE_HOST_ALL_PROXY_PORT: '8081',
      CLAUDE_CODE_HOST_HTTPS_PROXY_PORT: '8443',
      CLAUDE_CODE_HOST_HTTP_PROXY_PORT: '8080',
      CLAUDE_TMPDIR: '/tmp/claude',
      USER: 'eager-quiet-hopper',
    },
    {
      report: true,
      agentId: 'claude-code',
      agentVersion: 'unknown',
      surface: 'cloud-sandbox',
      confidence: 'declared',
    },
  ),

  // Claude Code with no version variable of its own, launched by a Node
  // installed through nvm. The executable path carries a version-shaped
  // segment that belongs to Node, not the harness — this row pins that it is
  // never mistaken for one.
  fixture(
    'claude-code-nvm-node',
    {
      CLAUDECODE: '1',
      CLAUDE_CODE_ENTRYPOINT: 'cli',
      CLAUDE_CODE_SESSION_ID: 'cc_nvm',
      TERM: 'xterm-256color',
      USER: 'joey',
    },
    {
      report: true,
      agentId: 'claude-code',
      agentVersion: 'unknown',
      surface: 'terminal',
      confidence: 'declared',
      sessionVar: 'CLAUDE_CODE_SESSION_ID',
    },
    { execPath: '/Users/joey/.nvm/versions/node/v22.14.0/bin/node' },
  ),

  fixture(
    'codex',
    {
      CODEX_SANDBOX: 'seatbelt',
      CODEX_THREAD_ID: 'th_01HQ',
      CODEX_VERSION: '0.47.0',
      TERM: 'xterm',
    },
    {
      report: true,
      agentId: 'codex',
      agentVersion: '0.47.0',
      surface: 'terminal',
      confidence: 'declared',
      sessionVar: 'CODEX_THREAD_ID',
    },
  ),

  fixture(
    'antigravity-ide',
    {
      ANTIGRAVITY_AGENT: '1',
      ANTIGRAVITY_LS_VERSION: '1.2.4',
      ANTIGRAVITY_TRAJECTORY_ID: 'tj_42',
      TERM: 'xterm-256color',
      TERM_PROGRAM: 'vscode',
      VSCODE_PID: '4242',
    },
    {
      report: true,
      agentId: 'antigravity',
      agentVersion: '1.2.4',
      surface: 'ide',
      confidence: 'declared',
      sessionVar: 'ANTIGRAVITY_TRAJECTORY_ID',
    },
  ),

  fixture(
    'cursor',
    { CURSOR_AGENT: '1', CURSOR_CONVERSATION_ID: 'cv_7', TERM: 'xterm' },
    {
      report: true,
      agentId: 'cursor',
      agentVersion: 'unknown',
      surface: 'terminal',
      confidence: 'declared',
      sessionVar: 'CURSOR_CONVERSATION_ID',
    },
  ),

  // Two harnesses declare themselves at once. The one with more matched
  // signals wins, so the verdict doesn't depend on environment ordering.
  fixture(
    'claude-code-in-cursor',
    {
      CLAUDECODE: '1',
      CLAUDE_CODE_ENTRYPOINT: 'cli',
      CLAUDE_CODE_SESSION_ID: 'cc_1',
      CURSOR_AGENT: '1',
      TERM: 'xterm',
    },
    {
      report: true,
      agentId: 'claude-code',
      agentVersion: 'unknown',
      surface: 'terminal',
      confidence: 'declared',
      sessionVar: 'CLAUDE_CODE_SESSION_ID',
    },
  ),

  fixture(
    'unknown-harness',
    { NEWTOOL_SESSION_ID: 'nt_1', TERM: 'xterm' },
    {
      report: true,
      agentId: 'unknown',
      agentDetectedBy: 'NEWTOOL_SESSION_ID',
      surface: 'terminal',
      confidence: 'declared',
    },
  ),

  fixture(
    'macos-iterm',
    {
      ITERM_SESSION_ID: 'w0t0p0:2B3C',
      TERM: 'xterm-256color',
      TERM_PROGRAM: 'iTerm.app',
      TERM_SESSION_ID: 'w0t0p0:1A2B',
      USER: 'joey',
      __CFBundleIdentifier: 'com.googlecode.iterm2',
    },
    HUMAN,
    { streams: ATTACHED },
  ),

  fixture(
    'ssh-session',
    {
      SSH_AGENT: '/tmp/ssh-agent.sock',
      SSH_AUTH_SOCK: '/tmp/ssh-auth.sock',
      SSH_SESSION_ID: 's_1',
      TERM: 'xterm',
      USER: 'joey',
      XDG_SESSION_ID: '3',
    },
    HUMAN,
    { streams: ATTACHED },
  ),

  fixture(
    'gpg-agent',
    {
      GPG_AGENT: '/run/user/501/gnupg/S.gpg-agent',
      GPG_AGENT_INFO: '/run/user/501/gnupg/S.gpg-agent:0:1',
      HTTP_USER_AGENT: 'curl/8.4.0',
      TERM: 'xterm',
      USER: 'joey',
      USER_AGENT: 'curl/8.4.0',
    },
    HUMAN,
    { streams: ATTACHED },
  ),

  fixture(
    'headless-three-signals',
    {
      CLICOLOR_FORCE: '1',
      NO_COLOR: '1',
      PAGER: 'cat',
      TERM: 'dumb',
      USER: 'joey',
    },
    {
      report: true,
      agentId: 'unknown',
      surface: 'terminal',
      confidence: 'heuristic',
    },
  ),

  // Two signals is noise, not a verdict.
  fixture('headless-two-signals', { PAGER: 'cat', TERM: 'dumb', USER: 'joey' }, HUMAN, {
    streams: { tty: [false, false, false], socket: [false, false, false] },
  }),

  // Three signals, but a terminal is attached, so the heuristic path never
  // opens. Without the terminal gate this run would report as an agent.
  fixture(
    'tty-with-three-signals',
    {
      ALL_PROXY: 'socks5://127.0.0.1:1080',
      CLICOLOR_FORCE: '1',
      HTTPS_PROXY: 'http://127.0.0.1:8080',
      HTTP_PROXY: 'http://127.0.0.1:8080',
      NO_COLOR: '1',
      PAGER: 'cat',
      TERM: 'xterm',
      USER: 'joey',
    },
    { report: true, surface: 'cloud-sandbox', confidence: 'none' },
    { streams: ATTACHED },
  ),

  // A developer running a local debug proxy. A sandbox signal fires, but with
  // no terminal-less run behind it the verdict stays `none`. The
  // `cloud-sandbox` surface is a known false positive for this setup.
  fixture(
    'local-debug-proxy',
    {
      ALL_PROXY: 'socks5://127.0.0.1:1080',
      HTTPS_PROXY: 'http://127.0.0.1:8080',
      HTTP_PROXY: 'http://127.0.0.1:8080',
      TERM: 'xterm',
      USER: 'joey',
    },
    { report: true, surface: 'cloud-sandbox', confidence: 'none' },
    { streams: ATTACHED },
  ),

  // Four sandbox signals and a terminal attached. Still `none` — this is the
  // row that pins sandbox traces never raising a verdict on their own.
  fixture(
    'sandbox-signals-without-headless',
    {
      ALL_PROXY: 'socks5://localhost:1080',
      HTTPS_PROXY: 'http://127.0.0.1:8080',
      HTTP_PROXY: 'http://127.0.0.1:8080',
      JAVA_TOOL_OPTIONS: '-javaagent:/opt/sandbox/agent.jar',
      SANDBOX_RUNTIME: 'gvisor',
      TERM: 'xterm',
      USER: 'eager-quiet-hopper',
    },
    { report: true, surface: 'cloud-sandbox', confidence: 'none' },
    { streams: ATTACHED, cwd: '/mnt/sessions/8a1f2c3d4e5f6071/app' },
  ),
];
