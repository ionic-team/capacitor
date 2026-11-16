import { mkdirp, readFileSync, writeFileSync } from 'fs-extra';
import { join } from 'path';

import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { ensureSPMGitignoreEntry } from '../src/util/spm';

import { mktmp } from './util';

const TEMPLATE_GITIGNORE = `.DS_Store
/.build
/Packages
/*.xcodeproj
xcuserdata/
DerivedData/
.swiftpm/config/registries.json
.swiftpm/xcode/package.xcworkspace/contents.xcworkspacedata
.netrc
`;

function makeConfig(nativeProjectDirAbs: string): Config {
  return { ios: { nativeProjectDirAbs } } as unknown as Config;
}

describe('ensureSPMGitignoreEntry', () => {
  let tmpDir: any;
  let nativeProjectDirAbs: string;
  let gitignorePath: string;

  beforeEach(async () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);

    tmpDir = await mktmp();
    nativeProjectDirAbs = join(tmpDir.path, 'App');
    gitignorePath = join(nativeProjectDirAbs, 'CapApp-SPM', '.gitignore');
    await mkdirp(join(nativeProjectDirAbs, 'CapApp-SPM'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  it('appends /Package.resolved to a .gitignore that does not have it', async () => {
    writeFileSync(gitignorePath, TEMPLATE_GITIGNORE);

    await ensureSPMGitignoreEntry(makeConfig(nativeProjectDirAbs));

    const lines = readFileSync(gitignorePath, 'utf-8').split('\n');
    expect(lines).toContain('/Package.resolved');
  });

  it('preserves existing content when appending', async () => {
    writeFileSync(gitignorePath, TEMPLATE_GITIGNORE);

    await ensureSPMGitignoreEntry(makeConfig(nativeProjectDirAbs));

    const contents = readFileSync(gitignorePath, 'utf-8');
    expect(contents).toContain('.DS_Store');
    expect(contents).toContain('/.build');
    expect(contents).toContain('.netrc');
  });

  it('is idempotent — skips and warns when entry is already present', async () => {
    writeFileSync(gitignorePath, TEMPLATE_GITIGNORE + '/Package.resolved\n');
    const before = readFileSync(gitignorePath, 'utf-8');

    await ensureSPMGitignoreEntry(makeConfig(nativeProjectDirAbs));

    expect(readFileSync(gitignorePath, 'utf-8')).toBe(before);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('/Package.resolved'));
  });

  it('skips and warns when the .gitignore file does not exist', async () => {
    await ensureSPMGitignoreEntry(makeConfig(nativeProjectDirAbs));

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('appends correctly when the file does not end with a newline', async () => {
    writeFileSync(gitignorePath, '.DS_Store');

    await ensureSPMGitignoreEntry(makeConfig(nativeProjectDirAbs));

    const contents = readFileSync(gitignorePath, 'utf-8');
    expect(contents).toBe('.DS_Store\n/Package.resolved\n');
  });
});
