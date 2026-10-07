import { existsSync, mkdirp, readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';
import type { PlistObject } from 'plist';
import { parse } from 'plist';
import { project as loadXcodeProject } from 'xcode';
import type { XCBuildConfiguration } from 'xcode';

import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { __testables, removeDebugXcconfig } from '../src/tasks/migrate-debug-xcconfig';
import { removeInfoPlistDebug } from '../src/util/spm';
import { removeBaseConfigurationFile } from '../src/util/xcode';

import { mktmp } from './util';

const { classifyDebugXcconfig } = __testables;

const REPO_ROOT = resolve(__dirname, '..', '..');
const SPM_PBXPROJ = resolve(REPO_ROOT, 'ios-spm-template/App/App.xcodeproj/project.pbxproj');
const PODS_PBXPROJ = resolve(REPO_ROOT, 'ios-pods-template/App/App.xcodeproj/project.pbxproj');

const DEBUG_XCCONFIG_UUID = '958DCC722DB07C7200EA8C5F';
const DEBUG_XCCONFIG_REF = `${DEBUG_XCCONFIG_UUID} /* debug.xcconfig */`;

const STOCK_XCCONFIG = 'CAPACITOR_DEBUG = true\n';
const CUSTOM_XCCONFIG = 'CAPACITOR_DEBUG = true\nOTHER_SWIFT_FLAGS = -DMY_FLAG\n';

const INFO_PLIST_WITH_DEBUG = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CAPACITOR_DEBUG</key>
  <string>$(CAPACITOR_DEBUG)</string>
  <key>CFBundleDisplayName</key>
  <string>My App</string>
</dict>
</plist>
`;

const INFO_PLIST_WITHOUT_DEBUG = INFO_PLIST_WITH_DEBUG.replace(
  '  <key>CAPACITOR_DEBUG</key>\n  <string>$(CAPACITOR_DEBUG)</string>\n',
  '',
);

/**
 * Re-add the four pbxproj entries that 67cd15bd removed from the SPM template, so the
 * fixture looks like an iOS project created before Capacitor 9.
 */
function withDebugXcconfig(source: string): string {
  return source
    .replace(
      '/* End PBXFileReference section */',
      `\t\t${DEBUG_XCCONFIG_REF} = {isa = PBXFileReference; lastKnownFileType = text.xcconfig; name = debug.xcconfig; path = ../debug.xcconfig; sourceTree = SOURCE_ROOT; };\n/* End PBXFileReference section */`,
    )
    .replace(
      '\t\t\t\t504EC3061FED79650016851F /* App */,',
      `\t\t\t\t${DEBUG_XCCONFIG_REF},\n\t\t\t\t504EC3061FED79650016851F /* App */,`,
    )
    .replace(
      /\/\* Debug \*\/ = \{\n\t\t\tisa = XCBuildConfiguration;\n/g,
      `/* Debug */ = {\n\t\t\tisa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = ${DEBUG_XCCONFIG_REF};\n`,
    );
}

function buildConfigurations(pbxprojPath: string): XCBuildConfiguration[] {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();
  const section = project.hash.project.objects.XCBuildConfiguration;
  return Object.keys(section)
    .filter((key) => !key.endsWith('_comment'))
    .map((key) => section[key] as unknown as XCBuildConfiguration);
}

describe('withDebugXcconfig fixture', () => {
  it('reproduces the pre-9.0 SPM template', () => {
    const source = withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8'));

    expect(
      source.match(/^\t\t958DCC722DB07C7200EA8C5F \/\* debug\.xcconfig \*\/ = \{isa = PBXFileReference;/m),
    ).not.toBeNull();
    expect(source.match(/^\t\t\t\t958DCC722DB07C7200EA8C5F \/\* debug\.xcconfig \*\/,$/m)).not.toBeNull();
    expect(source.match(/baseConfigurationReference/g)).toHaveLength(2);
  });
});

describe('removeBaseConfigurationFile', () => {
  let tmpDir: any;
  let pbxprojPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    pbxprojPath = join(tmpDir.path, 'project.pbxproj');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('unregisters the file from every pbxproj section', () => {
    writeFileSync(pbxprojPath, withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8')));

    const result = removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    expect(result.removed).toBe(true);
    expect(readFileSync(pbxprojPath, 'utf-8')).not.toContain('debug.xcconfig');
  });

  it('clears baseConfigurationReference on both Debug configurations', () => {
    writeFileSync(pbxprojPath, withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8')));

    removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    for (const configuration of buildConfigurations(pbxprojPath)) {
      expect(configuration.baseConfigurationReference).toBeUndefined();
    }
  });

  it('leaves the rest of the project intact', () => {
    writeFileSync(pbxprojPath, withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8')));

    removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    const project = loadXcodeProject(pbxprojPath);
    project.parseSync();
    expect(project.getFirstTarget().uuid).toBeDefined();
    expect(project.hasFile('CapacitorView.swift')).toBeTruthy();
  });

  it('is a no-op on a project that never referenced it', () => {
    const shipped = readFileSync(SPM_PBXPROJ, 'utf-8');
    writeFileSync(pbxprojPath, shipped);

    const result = removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    expect(result.removed).toBe(false);
    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(shipped);
  });

  it('is idempotent across repeated runs', () => {
    writeFileSync(pbxprojPath, withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8')));

    removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');
    const firstOutput = readFileSync(pbxprojPath, 'utf-8');
    removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(firstOutput);
  });

  it('does not touch a CocoaPods project Pods-App.debug.xcconfig', () => {
    const shipped = readFileSync(PODS_PBXPROJ, 'utf-8');
    writeFileSync(pbxprojPath, shipped);

    const result = removeBaseConfigurationFile(pbxprojPath, 'debug.xcconfig');

    expect(result.removed).toBe(false);
    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(shipped);
    expect(readFileSync(pbxprojPath, 'utf-8')).toContain('Pods-App.debug.xcconfig');
  });
});

describe('removeInfoPlistDebug', () => {
  let tmpDir: any;
  let plistPath: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mktmp();
    plistPath = join(tmpDir.path, 'Info.plist');
    config = { ios: { nativeTargetDirAbs: tmpDir.path } } as unknown as Config;
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('removes the key and preserves sibling keys', () => {
    writeFileSync(plistPath, INFO_PLIST_WITH_DEBUG);

    const result = removeInfoPlistDebug(config);

    expect(result.status).toBe('removed');
    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['CAPACITOR_DEBUG']).toBeUndefined();
    expect(parsed['CFBundleDisplayName']).toBe('My App');
  });

  it('reports unchanged when the key is absent', () => {
    writeFileSync(plistPath, INFO_PLIST_WITHOUT_DEBUG);
    const before = readFileSync(plistPath, 'utf-8');

    const result = removeInfoPlistDebug(config);

    expect(result.status).toBe('unchanged');
    expect(readFileSync(plistPath, 'utf-8')).toBe(before);
  });

  it('skips when the plist does not exist', () => {
    const result = removeInfoPlistDebug(config);

    expect(result.status).toBe('skipped');
    expect(result.status === 'skipped' && result.reason).toContain('not found');
  });
});

describe('classifyDebugXcconfig', () => {
  let tmpDir: any;
  let xcconfigPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    xcconfigPath = join(tmpDir.path, 'debug.xcconfig');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('reports absent when the file does not exist', () => {
    expect(classifyDebugXcconfig(xcconfigPath)).toBe('absent');
  });

  it('reports stock for the shipped one-line file', () => {
    writeFileSync(xcconfigPath, STOCK_XCCONFIG);
    expect(classifyDebugXcconfig(xcconfigPath)).toBe('stock');
  });

  it('ignores blank lines and comments', () => {
    writeFileSync(xcconfigPath, '// Capacitor\n\nCAPACITOR_DEBUG = true\n\n');
    expect(classifyDebugXcconfig(xcconfigPath)).toBe('stock');
  });

  it('reports customized when another setting is present', () => {
    writeFileSync(xcconfigPath, CUSTOM_XCCONFIG);
    expect(classifyDebugXcconfig(xcconfigPath)).toBe('customized');
  });
});

describe('removeDebugXcconfig', () => {
  let tmpDir: any;
  let platformDirAbs: string;
  let xcconfigPath: string;
  let pbxprojPath: string;
  let plistPath: string;

  function makeConfig(packageManager: string): Config {
    return {
      ios: {
        platformDirAbs,
        nativeXcodeProjDirAbs: join(platformDirAbs, 'App', 'App.xcodeproj'),
        nativeTargetDirAbs: join(platformDirAbs, 'App', 'App'),
        packageManager: Promise.resolve(packageManager),
      },
    } as unknown as Config;
  }

  beforeEach(async () => {
    jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    jest.spyOn(logger, 'info').mockImplementation(() => undefined);

    tmpDir = await mktmp();
    platformDirAbs = join(tmpDir.path, 'ios');
    xcconfigPath = join(platformDirAbs, 'debug.xcconfig');
    pbxprojPath = join(platformDirAbs, 'App', 'App.xcodeproj', 'project.pbxproj');
    plistPath = join(platformDirAbs, 'App', 'App', 'Info.plist');

    await mkdirp(join(platformDirAbs, 'App', 'App.xcodeproj'));
    await mkdirp(join(platformDirAbs, 'App', 'App'));
    writeFileSync(xcconfigPath, STOCK_XCCONFIG);
    writeFileSync(pbxprojPath, withDebugXcconfig(readFileSync(SPM_PBXPROJ, 'utf-8')));
    writeFileSync(plistPath, INFO_PLIST_WITH_DEBUG);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tmpDir.cleanupCallback();
  });

  it('deletes the stock file and unwires it from the project', async () => {
    await removeDebugXcconfig(makeConfig('SPM'));

    expect(existsSync(xcconfigPath)).toBe(false);
    expect(readFileSync(pbxprojPath, 'utf-8')).not.toContain('debug.xcconfig');
    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['CAPACITOR_DEBUG']).toBeUndefined();
  });

  it('keeps a customized file and its project reference, but still cleans the plist', async () => {
    writeFileSync(xcconfigPath, CUSTOM_XCCONFIG);
    const pbxprojBefore = readFileSync(pbxprojPath, 'utf-8');

    await removeDebugXcconfig(makeConfig('SPM'));

    expect(readFileSync(xcconfigPath, 'utf-8')).toBe(CUSTOM_XCCONFIG);
    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(pbxprojBefore);
    const parsed = parse(readFileSync(plistPath, 'utf-8')) as PlistObject;
    expect(parsed['CAPACITOR_DEBUG']).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('build settings besides CAPACITOR_DEBUG'));
  });

  it('does nothing for a CocoaPods project', async () => {
    const pbxprojBefore = readFileSync(pbxprojPath, 'utf-8');
    const plistBefore = readFileSync(plistPath, 'utf-8');

    await removeDebugXcconfig(makeConfig('Cocoapods'));

    expect(existsSync(xcconfigPath)).toBe(true);
    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(pbxprojBefore);
    expect(readFileSync(plistPath, 'utf-8')).toBe(plistBefore);
  });

  it('is idempotent across repeated runs', async () => {
    await removeDebugXcconfig(makeConfig('SPM'));
    const firstPbxproj = readFileSync(pbxprojPath, 'utf-8');
    const firstPlist = readFileSync(plistPath, 'utf-8');

    await removeDebugXcconfig(makeConfig('SPM'));

    expect(readFileSync(pbxprojPath, 'utf-8')).toBe(firstPbxproj);
    expect(readFileSync(plistPath, 'utf-8')).toBe(firstPlist);
  });

  it('leaves the file in place when the project cannot be rewritten', async () => {
    writeFileSync(pbxprojPath, 'not a pbxproj');

    await removeDebugXcconfig(makeConfig('SPM'));

    expect(existsSync(xcconfigPath)).toBe(true);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Remove debug.xcconfig from the Xcode project'));
  });
});
