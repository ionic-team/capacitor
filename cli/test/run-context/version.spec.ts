import { detectAgentVersion } from '../../src/run-context/version';

describe('detectAgentVersion', () => {
  describe('AI_AGENT', () => {
    it('parses the shared <vendor>_<version>_agent convention', () => {
      expect(detectAgentVersion({ AI_AGENT: 'claude-code_2-1-236_agent' }, 'claude-code')).toBe('2.1.236');
    });

    it('wins over the vendor variable', () => {
      expect(detectAgentVersion({ AI_AGENT: 'codex_1-0-0_agent', CODEX_VERSION: '0.47.0' }, 'codex')).toBe('1.0.0');
    });

    // "First hit" means first present, not first valid: a harness that sets
    // AI_AGENT to junk reports unknown rather than falling through to a
    // variable it never set.
    it('does not fall through to the vendor variable when malformed', () => {
      expect(detectAgentVersion({ AI_AGENT: 'not-a-version', CODEX_VERSION: '0.47.0' }, 'codex')).toBe('unknown');
    });
  });

  describe('vendor variable', () => {
    it('reads the version from the harness own variable', () => {
      expect(detectAgentVersion({ CODEX_VERSION: '0.47.0' }, 'codex')).toBe('0.47.0');
      expect(detectAgentVersion({ ANTIGRAVITY_LS_VERSION: '1.2.4' }, 'antigravity')).toBe('1.2.4');
    });

    it('pulls the version out of a JSON-valued variable', () => {
      expect(detectAgentVersion({ MUSE_RELEASE_INFO: '{"version":"3.1.0"}' }, 'muse')).toBe('3.1.0');
    });

    it('reports unknown for unparseable JSON', () => {
      expect(detectAgentVersion({ MUSE_RELEASE_INFO: '{not json' }, 'muse')).toBe('unknown');
    });

    it('is ignored for a harness with no registered source', () => {
      expect(detectAgentVersion({ CURSOR_AGENT: '1' }, 'cursor')).toBe('unknown');
    });
  });

  describe('semver validation', () => {
    it.each(['2.1', 'latest', 'v-nope', '1.2.3.4', ''])('reports unknown for %p', (value) => {
      expect(detectAgentVersion({ CODEX_VERSION: value }, 'codex')).toBe('unknown');
    });

    it('reports unknown when no source carries anything', () => {
      expect(detectAgentVersion({}, 'claude-code')).toBe('unknown');
    });
  });
});
