import { copyFileSync, mkdirpSync, readFileSync } from 'fs-extra';
import { join, resolve } from 'path';

import type { Config } from '../src/definitions';
import {
  editProjectSettingsIOS,
  getMajoriOSVersion,
  getXcodeProjectFile,
  setXcprojDeploymentTarget,
} from '../src/ios/common';

import { mktmp } from './util';

const REPO_ROOT = resolve(__dirname, '..', '..');
const SHIPPED_TEMPLATE = resolve(REPO_ROOT, 'ios-spm-template/App');
const XCPROJ = resolve(__dirname, 'fixtures/xcproj/default/project.xcproj');
const XCPROJ_PER_CONFIG = resolve(__dirname, 'fixtures/xcproj/per-config/project.xcproj');

describe('Xcode project file', () => {
  let tmpDir: any;
  let projectDir: string;
  let config: Config;

  beforeEach(async () => {
    tmpDir = await mktmp();
    projectDir = join(tmpDir.path, 'App.xcodeproj');
    const targetDir = join(tmpDir.path, 'App');
    mkdirpSync(projectDir);
    mkdirpSync(targetDir);
    copyFileSync(join(SHIPPED_TEMPLATE, 'App', 'Info.plist'), join(targetDir, 'Info.plist'));
    config = {
      app: { appId: 'com.example.renamed', appName: 'Renamed' },
      ios: { nativeXcodeProjDirAbs: projectDir, nativeTargetDirAbs: targetDir },
    } as unknown as Config;
  });

  afterEach(() => {
    tmpDir.cleanupCallback();
  });

  const pbxprojPath = () => join(projectDir, 'project.pbxproj');
  const xcprojPath = () => join(projectDir, 'project.xcproj');
  const writePbxproj = () => copyFileSync(join(SHIPPED_TEMPLATE, 'App.xcodeproj', 'project.pbxproj'), pbxprojPath());
  const writeXcproj = (fixture = XCPROJ) => copyFileSync(fixture, xcprojPath());

  it('uses project.pbxproj when the project has one', () => {
    writePbxproj();
    writeXcproj();

    expect(getXcodeProjectFile(config)).toBe(pbxprojPath());
  });

  it('uses project.xcproj when the project only has that', () => {
    writeXcproj();

    expect(getXcodeProjectFile(config)).toBe(xcprojPath());
  });

  it('reads the major deployment target from project.pbxproj', () => {
    writePbxproj();

    expect(getMajoriOSVersion(config)).toBe('15');
  });

  it('reads the major deployment target from project.xcproj', () => {
    writeXcproj();

    expect(getMajoriOSVersion(config)).toBe('15');
  });

  it('reads the lowest deployment target when project.xcproj sets one per configuration', () => {
    writeXcproj(XCPROJ_PER_CONFIG);

    expect(getMajoriOSVersion(config)).toBe('15');
  });

  it('sets every deployment target in project.xcproj', () => {
    writeXcproj(XCPROJ_PER_CONFIG);

    expect(setXcprojDeploymentTarget(xcprojPath(), '17.0')).toBe(true);

    const content = readFileSync(xcprojPath(), 'utf-8');
    expect(content.match(/"IPHONEOS_DEPLOYMENT_TARGET\[config=(Debug|Release)\]": "17\.0"/g)).toHaveLength(4);
    expect(content).not.toMatch(/"IPHONEOS_DEPLOYMENT_TARGET[^"]*": "1[56]\.0"/);
    expect(getMajoriOSVersion(config)).toBe('17');
  });

  it('sets the bundle identifier in project.xcproj and keeps the rest of the file', async () => {
    writeXcproj();
    const original = readFileSync(XCPROJ, 'utf-8');

    await editProjectSettingsIOS(config);

    expect(readFileSync(xcprojPath(), 'utf-8')).toBe(
      original.replace(
        '"PRODUCT_BUNDLE_IDENTIFIER": "com.getcapacitor.App"',
        '"PRODUCT_BUNDLE_IDENTIFIER": "com.example.renamed"',
      ),
    );
  });

  it('still sets the bundle identifier in project.pbxproj', async () => {
    writePbxproj();

    await editProjectSettingsIOS(config);

    const content = readFileSync(pbxprojPath(), 'utf-8');
    expect(content).toContain('PRODUCT_BUNDLE_IDENTIFIER = com.example.renamed;');
    expect(content).not.toContain('PRODUCT_BUNDLE_IDENTIFIER = com.getcapacitor.App;');
  });
});
