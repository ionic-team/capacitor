import { readFileSync, writeFileSync } from 'fs-extra';
import { join, resolve } from 'path';
import { project as loadXcodeProject } from 'xcode';

import {
  addSwiftFileToAppTarget,
  findGroupUuidByComment,
  removeStoryboardFromAppTarget,
  removeSwiftFileFromAppTarget,
} from '../src/util/xcode';

import { mktmp } from './util';

const REPO_ROOT = resolve(__dirname, '..', '..');
const SHIPPED_PBXPROJ = resolve(REPO_ROOT, 'ios-spm-template/App/App.xcodeproj/project.pbxproj');
const PRE_SWIFTUI_PBXPROJ = resolve(__dirname, 'fixtures/pre-swiftui-project.pbxproj');

const SCENE_DELEGATE_UUIDS = ['9582B6822FE993A50072D4E8', '9582B6832FE993A70072D4E8'];
const MAIN_STORYBOARD_UUIDS = ['504EC30B1FED79650016851F', '504EC30C1FED79650016851F', '504EC30D1FED79650016851F'];
const LAUNCH_SCREEN_UUIDS = ['504EC3101FED79650016851F', '504EC3111FED79650016851F', '504EC3121FED79650016851F'];

function stripCapacitorView(source: string): string {
  return source
    .split('\n')
    .filter((line) => !line.includes('CapacitorView'))
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
    const preMigrationSource = stripCapacitorView(readFileSync(SHIPPED_PBXPROJ, 'utf-8'));
    writeFileSync(pbxprojPath, preMigrationSource);

    const result = addSwiftFileToAppTarget(pbxprojPath, 'App', 'CapacitorView.swift');

    expect(result.added).toBe(true);

    // Reparse the written file and verify each section.
    const project = loadXcodeProject(pbxprojPath);
    project.parseSync();

    const objects = project.hash.project.objects;

    const fileRefs = Object.entries(objects.PBXFileReference).filter(([k]) => !k.endsWith('_comment'));
    expect(fileRefs.some(([, ref]) => typeof ref === 'object' && (ref as any).path === '"CapacitorView.swift"')).toBe(
      true,
    );

    const buildFiles = Object.entries(objects.PBXBuildFile).filter(([k]) => !k.endsWith('_comment'));
    expect(
      buildFiles.some(([k]) => (objects.PBXBuildFile as any)[`${k}_comment`]?.includes('CapacitorView.swift')),
    ).toBe(true);

    const appGroupUuid = findGroupUuidByComment(project, 'App')!;
    const appGroup = project.getPBXGroupByKey(appGroupUuid)!;
    expect(appGroup.children.some((c: any) => c.comment === 'CapacitorView.swift')).toBe(true);

    const sourcesPhase = objects.PBXSourcesBuildPhase!;
    const sourcesEntries = Object.entries(sourcesPhase).filter(([k]) => !k.endsWith('_comment'));
    const [, sourcesObj] = sourcesEntries[0];
    expect((sourcesObj as any).files.some((f: any) => f.comment?.includes('CapacitorView.swift'))).toBe(true);
  });

  it('is a no-op when the file is already registered', () => {
    writeFileSync(pbxprojPath, readFileSync(SHIPPED_PBXPROJ, 'utf-8'));

    const before = readFileSync(pbxprojPath, 'utf-8');
    const result = addSwiftFileToAppTarget(pbxprojPath, 'App', 'CapacitorView.swift');
    const after = readFileSync(pbxprojPath, 'utf-8');

    expect(result.added).toBe(false);
    expect(after).toBe(before);
  });

  it('is idempotent across repeated runs', () => {
    const preMigrationSource = stripCapacitorView(readFileSync(SHIPPED_PBXPROJ, 'utf-8'));
    writeFileSync(pbxprojPath, preMigrationSource);

    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'CapacitorView.swift').added).toBe(true);
    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'CapacitorView.swift').added).toBe(false);
    expect(addSwiftFileToAppTarget(pbxprojPath, 'App', 'CapacitorView.swift').added).toBe(false);
  });

  it('throws when the target group cannot be found', () => {
    writeFileSync(pbxprojPath, stripCapacitorView(readFileSync(SHIPPED_PBXPROJ, 'utf-8')));

    expect(() => addSwiftFileToAppTarget(pbxprojPath, 'DoesNotExist', 'CapacitorView.swift')).toThrow(
      /Could not find PBXGroup/,
    );
  });
});

describe('removing UIKit entry-point files from a pre-SwiftUI project', () => {
  let tmpDir: any;
  let pbxprojPath: string;

  beforeEach(async () => {
    tmpDir = await mktmp();
    pbxprojPath = join(tmpDir.path, 'project.pbxproj');
    writeFileSync(pbxprojPath, readFileSync(PRE_SWIFTUI_PBXPROJ, 'utf-8'));
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  describe('removeSwiftFileFromAppTarget', () => {
    it('clears SceneDelegate.swift from all four pbxproj sections', () => {
      expect(removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift').removed).toBe(true);

      const objects = reparse(pbxprojPath);

      expect(entries(objects.PBXFileReference).some(([, ref]) => unquote(ref.path) === 'SceneDelegate.swift')).toBe(
        false,
      );
      expect(entries(objects.PBXBuildFile).some(([, f]) => f.fileRef === SCENE_DELEGATE_UUIDS[0])).toBe(false);
      expect(appGroupChildComments(pbxprojPath)).not.toContain('SceneDelegate.swift');
      expect(buildPhaseComments(objects.PBXSourcesBuildPhase).join()).not.toContain('SceneDelegate.swift');
    });

    it('leaves AppDelegate.swift registered', () => {
      removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift');

      const objects = reparse(pbxprojPath);

      expect(entries(objects.PBXFileReference).some(([, ref]) => unquote(ref.path) === 'AppDelegate.swift')).toBe(true);
      expect(buildPhaseComments(objects.PBXSourcesBuildPhase).join()).toContain('AppDelegate.swift');
    });

    it('leaves no dangling references to the removed UUIDs', () => {
      removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift');

      const written = readFileSync(pbxprojPath, 'utf-8');
      for (const uuid of SCENE_DELEGATE_UUIDS) {
        expect(written).not.toContain(uuid);
      }
    });

    it('is a no-op once the file is gone', () => {
      expect(removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift').removed).toBe(true);

      const after = readFileSync(pbxprojPath, 'utf-8');
      expect(removeSwiftFileFromAppTarget(pbxprojPath, 'SceneDelegate.swift').removed).toBe(false);
      expect(readFileSync(pbxprojPath, 'utf-8')).toBe(after);
    });
  });

  describe('removeStoryboardFromAppTarget', () => {
    it('clears the Main.storyboard variant group, its Base file reference and its build entries', () => {
      expect(removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard').removed).toBe(true);

      const objects = reparse(pbxprojPath);

      expect(entries(objects.PBXVariantGroup!).some(([, g]) => unquote(g.name) === 'Main.storyboard')).toBe(false);
      expect(
        entries(objects.PBXFileReference).some(([, ref]) => unquote(ref.path) === 'Base.lproj/Main.storyboard'),
      ).toBe(false);
      expect(entries(objects.PBXBuildFile).some(([, f]) => f.fileRef === MAIN_STORYBOARD_UUIDS[0])).toBe(false);
      expect(appGroupChildComments(pbxprojPath)).not.toContain('Main.storyboard');
      expect(buildPhaseComments(objects.PBXResourcesBuildPhase).join()).not.toContain('Main.storyboard');
    });

    it('leaves LaunchScreen.storyboard fully registered', () => {
      removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard');

      const objects = reparse(pbxprojPath);

      expect(entries(objects.PBXVariantGroup!).some(([, g]) => unquote(g.name) === 'LaunchScreen.storyboard')).toBe(
        true,
      );
      expect(
        entries(objects.PBXFileReference).some(([, ref]) => unquote(ref.path) === 'Base.lproj/LaunchScreen.storyboard'),
      ).toBe(true);
      expect(appGroupChildComments(pbxprojPath)).toContain('LaunchScreen.storyboard');
      expect(buildPhaseComments(objects.PBXResourcesBuildPhase).join()).toContain('LaunchScreen.storyboard');

      const written = readFileSync(pbxprojPath, 'utf-8');
      for (const uuid of LAUNCH_SCREEN_UUIDS) {
        expect(written).toContain(uuid);
      }
    });

    it('leaves no dangling references to the removed UUIDs', () => {
      removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard');

      const written = readFileSync(pbxprojPath, 'utf-8');
      for (const uuid of MAIN_STORYBOARD_UUIDS) {
        expect(written).not.toContain(uuid);
      }
    });

    it('is a no-op once the storyboard is gone', () => {
      expect(removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard').removed).toBe(true);

      const after = readFileSync(pbxprojPath, 'utf-8');
      expect(removeStoryboardFromAppTarget(pbxprojPath, 'Main.storyboard').removed).toBe(false);
      expect(readFileSync(pbxprojPath, 'utf-8')).toBe(after);
    });
  });
});

function reparse(pbxprojPath: string) {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();
  return project.hash.project.objects;
}

function entries(section: Record<string, any>): [string, any][] {
  return Object.entries(section).filter(([key, value]) => !key.endsWith('_comment') && typeof value !== 'string');
}

function appGroupChildComments(pbxprojPath: string): string[] {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();
  const appGroup = project.getPBXGroupByKey(findGroupUuidByComment(project, 'App')!)!;
  return appGroup.children.map((child: any) => child.comment);
}

function buildPhaseComments(section: Record<string, any> | undefined): string[] {
  return entries(section ?? {}).flatMap(([, phase]) => phase.files.map((file: any) => file.comment));
}

function unquote(value: unknown): string {
  return typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : '';
}
