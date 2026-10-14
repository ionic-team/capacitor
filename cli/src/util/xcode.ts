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

/**
 * Unregister a Swift source file from an Xcode project.
 *
 * Clears the file's PBXBuildFile, its entry in every Sources build phase, its listing in
 * any PBXGroup, and its PBXFileReference. Matching is by resolved file reference UUID, so
 * nothing else that happens to share the name is touched. Idempotent: a second call is a
 * no-op and leaves the file untouched.
 *
 * @param pbxprojPath   Absolute path to project.pbxproj
 * @param fileName      Basename of the Swift file to unregister (e.g. 'SceneDelegate.swift')
 */
export function removeSwiftFileFromAppTarget(pbxprojPath: string, fileName: string): { removed: boolean } {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();

  const objects = project.hash.project.objects;
  const fileRefUuids = findSwiftFileUuidsByFileName(objects.PBXFileReference, fileName);
  if (fileRefUuids.length === 0) {
    return { removed: false };
  }

  const buildFileUuids = removeFromBuildFileSection(objects.PBXBuildFile, fileRefUuids);
  removeFromBuildPhaseFiles(objects.PBXSourcesBuildPhase, buildFileUuids);
  removeFromGroupChildren(objects.PBXGroup, fileRefUuids);
  for (const uuid of fileRefUuids) {
    deleteWithComment(objects.PBXFileReference, uuid);
  }

  writeFileSync(pbxprojPath, project.writeSync(), 'utf-8');
  return { removed: true };
}

/**
 * Unregister a storyboard from an Xcode project.
 *
 * A localized storyboard is a PBXVariantGroup whose children are the per-language
 * PBXFileReferences, and it is the variant group — not the file reference — that the
 * PBXBuildFile and the owning PBXGroup point at. Both levels are removed here, along with
 * the Resources build phase entry. Falls back to a bare PBXFileReference for a project
 * whose storyboard was moved out of Base.lproj. Idempotent: a second call is a no-op.
 *
 * @param pbxprojPath     Absolute path to project.pbxproj
 * @param storyboardName  Basename of the storyboard to unregister (e.g. 'Main.storyboard')
 */
export function removeStoryboardFromAppTarget(pbxprojPath: string, storyboardName: string): { removed: boolean } {
  const project = loadXcodeProject(pbxprojPath);
  project.parseSync();

  const objects = project.hash.project.objects;
  const variantGroupUuids = findVariantGroupUuidsByName(objects.PBXVariantGroup, storyboardName);
  const fileRefUuids = findStoryboardFileRefUuids(objects.PBXFileReference, storyboardName);
  const uuids = [...variantGroupUuids, ...fileRefUuids];
  if (uuids.length === 0) {
    return { removed: false };
  }

  const buildFileUuids = removeFromBuildFileSection(objects.PBXBuildFile, uuids);
  removeFromBuildPhaseFiles(objects.PBXResourcesBuildPhase, buildFileUuids);
  removeFromGroupChildren(objects.PBXGroup, uuids);
  for (const uuid of variantGroupUuids) {
    deleteWithComment(objects.PBXVariantGroup!, uuid);
  }
  for (const uuid of fileRefUuids) {
    deleteWithComment(objects.PBXFileReference, uuid);
  }

  writeFileSync(pbxprojPath, project.writeSync(), 'utf-8');
  return { removed: true };
}

function findSwiftFileUuidsByFileName(section: PbxprojSection, fileName: string): string[] {
  return sectionEntries(section)
    .filter(
      ([, fileReference]) =>
        unquote(fileReference['lastKnownFileType']) === 'sourcecode.swift' &&
        basename(unquote(fileReference['path'])) === fileName,
    )
    .map(([uuid]) => uuid);
}

function findVariantGroupUuidsByName(section: PbxprojSection | undefined, storyboardName: string): string[] {
  if (!section) return [];
  return sectionEntries(section)
    .filter(([, group]) => unquote(group['name']) === storyboardName)
    .map(([uuid]) => uuid);
}

function findStoryboardFileRefUuids(section: PbxprojSection, storyboardName: string): string[] {
  return sectionEntries(section)
    .filter(([, fileReference]) => basename(unquote(fileReference['path'])) === storyboardName)
    .map(([uuid]) => uuid);
}

/** Deletes every PBXBuildFile pointing at one of `fileRefUuids` and returns their UUIDs. */
function removeFromBuildFileSection(section: PbxprojSection, fileRefUuids: string[]): string[] {
  const removed: string[] = [];
  for (const [uuid, buildFile] of sectionEntries(section)) {
    if (!fileRefUuids.includes(buildFile['fileRef'] as string)) continue;
    removed.push(uuid);
    deleteWithComment(section, uuid);
  }
  return removed;
}

function removeFromBuildPhaseFiles(section: PbxprojSection | undefined, buildFileUuids: string[]): void {
  if (!section) return;
  for (const [, buildPhase] of sectionEntries(section)) {
    const files = buildPhase['files'] as { value: string }[] | undefined;
    if (!Array.isArray(files)) continue;
    buildPhase['files'] = files.filter((file) => !buildFileUuids.includes(file.value));
  }
}

function removeFromGroupChildren(section: PbxprojSection, uuids: string[]): void {
  for (const [, group] of sectionEntries(section)) {
    const children = group['children'] as { value: string }[] | undefined;
    if (!Array.isArray(children)) continue;
    group['children'] = children.filter((child) => !uuids.includes(child.value));
  }
}

function sectionEntries(section: PbxprojSection): [string, Record<string, unknown>][] {
  return Object.entries(section).filter(
    (entry): entry is [string, Record<string, unknown>] =>
      !entry[0].endsWith(COMMENT_SUFFIX) && typeof entry[1] !== 'string',
  );
}

function deleteWithComment(section: PbxprojSection, uuid: string): void {
  delete section[uuid];
  delete section[`${uuid}${COMMENT_SUFFIX}`];
}

function unquote(value: unknown): string {
  return typeof value === 'string' ? value.replace(/^"(.*)"$/, '$1') : '';
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
