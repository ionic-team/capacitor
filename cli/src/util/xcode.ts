import { writeFileSync } from 'fs-extra';
import { basename } from 'path';
import { project as loadXcodeProject } from 'xcode';
import type { PbxprojSection, XcodeProject } from 'xcode';

const COMMENT_SUFFIX = '_comment';

/**
 * Register a Swift source file with the first native target of an Xcode project.
 *
 * Writes entries in PBXFileReference, PBXBuildFile, the named PBXGroup's children,
 * and the target's Sources build phase. Idempotent: a second call is a no-op.
 *
 * @param pbxprojPath   Absolute path to project.pbxproj
 * @param groupName     Comment/name of the PBXGroup the file belongs under (e.g. 'App')
 * @param fileRelPath   Path of the file relative to the group (e.g. 'SceneDelegate.swift')
 */
export function addSwiftFileToAppTarget(
  pbxprojPath: string,
  groupName: string,
  fileRelPath: string,
): { added: boolean } {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();

  if (project.hasFile(fileRelPath)) {
    return { added: false };
  }

  const groupUuid = findGroupUuidByComment(project, groupName);
  if (!groupUuid) {
    throw new Error(`Could not find PBXGroup with comment "${groupName}" in ${pbxprojPath}`);
  }

  const targetUuid = project.getFirstTarget().uuid;
  const result = project.addSourceFile(fileRelPath, { target: targetUuid }, groupUuid);
  if (!result) {
    throw new Error(`Failed to register ${fileRelPath} in ${pbxprojPath}`);
  }

  writeFileSync(pbxprojPath, project.writeSync(), 'utf-8');
  return { added: true };
}

// Exported for tests.
export function findGroupUuidByComment(project: XcodeProject, comment: string): string | null {
  const groups = project.hash.project.objects.PBXGroup;
  for (const key of Object.keys(groups)) {
    if (!key.endsWith(COMMENT_SUFFIX)) continue;
    if (groups[key] === comment) {
      return key.substring(0, key.length - COMMENT_SUFFIX.length);
    }
  }
  return null;
}

/**
 * Unregister an .xcconfig file from an Xcode project.
 *
 * Clears the baseConfigurationReference of every build configuration using it, drops it
 * from any group it is listed under, and deletes its PBXFileReference. Matches on the
 * resolved file reference rather than on text, so a CocoaPods project's
 * Pods-App.debug.xcconfig is left alone. Idempotent: a second call is a no-op.
 *
 * @param pbxprojPath   Absolute path to project.pbxproj
 * @param fileName      Basename of the .xcconfig to unregister (e.g. 'debug.xcconfig')
 */
export function removeBaseConfigurationFile(pbxprojPath: string, fileName: string): { removed: boolean } {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();

  const objects = project.hash.project.objects;
  const uuids = findXCConfigUuidsByFileName(objects.PBXFileReference, fileName);
  if (uuids.length === 0) {
    return { removed: false };
  }

  clearBaseConfigurationReferences(objects.XCBuildConfiguration, uuids);
  removeFromGroupChildren(objects.PBXGroup, uuids);
  for (const uuid of uuids) {
    delete objects.PBXFileReference[uuid];
    delete objects.PBXFileReference[`${uuid}${COMMENT_SUFFIX}`];
  }

  writeFileSync(pbxprojPath, project.writeSync(), 'utf-8');
  return { removed: true };
}

function findXCConfigUuidsByFileName(section: PbxprojSection, fileName: string): string[] {
  const uuids: string[] = [];
  for (const key of Object.keys(section)) {
    if (key.endsWith(COMMENT_SUFFIX)) continue;
    const fileReference = section[key];
    if (typeof fileReference === 'string') continue;
    if (unquote(fileReference['lastKnownFileType']) !== 'text.xcconfig') continue;
    if (basename(unquote(fileReference['path'])) !== fileName) continue;
    uuids.push(key);
  }
  return uuids;
}

function clearBaseConfigurationReferences(section: PbxprojSection, uuids: string[]): void {
  for (const key of Object.keys(section)) {
    if (key.endsWith(COMMENT_SUFFIX)) continue;
    const buildConfiguration = section[key];
    if (typeof buildConfiguration === 'string') continue;
    const reference = buildConfiguration['baseConfigurationReference'];
    if (typeof reference !== 'string' || !uuids.includes(reference)) continue;
    delete buildConfiguration['baseConfigurationReference'];
    delete buildConfiguration[`baseConfigurationReference${COMMENT_SUFFIX}`];
  }
}

function removeFromGroupChildren(section: PbxprojSection, uuids: string[]): void {
  for (const key of Object.keys(section)) {
    if (key.endsWith(COMMENT_SUFFIX)) continue;
    const group = section[key];
    if (typeof group === 'string') continue;
    const children = group['children'] as { value: string }[] | undefined;
    if (!Array.isArray(children)) continue;
    group['children'] = children.filter((child) => !uuids.includes(child.value));
  }
}

function unquote(value: unknown): string {
  return typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : '';
}
