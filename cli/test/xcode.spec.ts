import { readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';
import { project as loadXcodeProject } from 'xcode';

import { addSwiftFileToAppTarget, findGroupUuidByComment } from '../src/util/xcode';

import { mktmp } from './util';

const REPO_ROOT = resolve(__dirname, '..', '..');
const SHIPPED_PBXPROJ = resolve(REPO_ROOT, 'ios-spm-template/App/App.xcodeproj/project.pbxproj');

function stripSceneDelegate(source: string): string {
  return source
    .split('\n')
    .filter((line) => !line.includes('SceneDelegate'))
    .join('\n');
}

describe('findGroupUuidByComment', () => {
  it('returns the UUID of the App group in the shipped pbxproj', () => {
    const project = loadXcodeProject(SHIPPED_PBXPROJ);
    project.parseSync();

    const uuid = findGroupUuidByComment(project, 'App');

    expect(uuid).toMatch(/^[A-F0-9]{24}$/);
    const group = project.getPBXGroupByKey(uuid!);
    expect(group).toBeDefined();
    expect(group?.path).toBe('App');
  });

  it('returns null for a group name that does not exist', () => {
    const project = loadXcodeProject(SHIPPED_PBXPROJ);
    project.parseSync();

    expect(findGroupUuidByComment(project, 'NonExistentGroup')).toBeNull();
  });
});

describe('addSwiftFileToAppTarget', () => {
  let tmpDir: any;
  let pbxprojPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    pbxprojPath = join(tmpDir.path, 'project.pbxproj');
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  it('registers a new Swift file in all four pbxproj sections', () => {
    const preUISceneSource = stripSceneDelegate(readFileSync(SHIPPED_PBXPROJ, 'utf-8'));
    writeFileSync(pbxprojPath, preUISceneSource);

    const result = addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift');

    expect(result.added).toBe(true);

    // Reparse the written file and verify each section.
    const project = loadXcodeProject(pbxprojPath);
    project.parseSync();

    const objects = project.hash.project.objects;

    const fileRefs = Object.entries(objects.PBXFileReference).filter(([k]) => !k.endsWith('_comment'));
    expect(fileRefs.some(([, ref]) => typeof ref === 'object' && (ref as any).path === '"SceneDelegate.swift"')).toBe(
      true,
    );

    const buildFiles = Object.entries(objects.PBXBuildFile).filter(([k]) => !k.endsWith('_comment'));
    expect(
      buildFiles.some(([k]) => (objects.PBXBuildFile as any)[`${k}_comment`]?.includes('SceneDelegate.swift')),
    ).toBe(true);

    const appGroupUuid = findGroupUuidByComment(project, 'App')!;
    const appGroup = project.getPBXGroupByKey(appGroupUuid)!;
    expect(appGroup.children.some((c: any) => c.comment === 'SceneDelegate.swift')).toBe(true);

    const sourcesPhase = objects.PBXSourcesBuildPhase!;
    const sourcesEntries = Object.entries(sourcesPhase).filter(([k]) => !k.endsWith('_comment'));
    const [, sourcesObj] = sourcesEntries[0];
    expect((sourcesObj as any).files.some((f: any) => f.comment?.includes('SceneDelegate.swift'))).toBe(true);
  });

  it('is a no-op when the file is already registered', () => {
    writeFileSync(pbxprojPath, readFileSync(SHIPPED_PBXPROJ, 'utf-8'));

    const before = readFileSync(pbxprojPath, 'utf-8');
    const result = addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift');
    const after = readFileSync(pbxprojPath, 'utf-8');

    expect(result.added).toBe(false);
    expect(after).toBe(before);
  });

  it('is idempotent across repeated runs', () => {
    const preUISceneSource = stripSceneDelegate(readFileSync(SHIPPED_PBXPROJ, 'utf-8'));
    writeFileSync(pbxprojPath, preUISceneSource);

    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift').added).toBe(true);
    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift').added).toBe(false);
    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'SceneDelegate.swift').added).toBe(false);
  });

  it('throws when the target group cannot be found', () => {
    writeFileSync(pbxprojPath, stripSceneDelegate(readFileSync(SHIPPED_PBXPROJ, 'utf-8')));

    expect(() => addSwiftFileToAppTarget(pbxprojPath, 'DoesNotExist', 'SceneDelegate.swift')).toThrow(
      /Could not find PBXGroup/,
    );
  });
});
