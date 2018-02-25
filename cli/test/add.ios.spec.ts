import { APP_ID, APP_NAME, run, makeAppDir, mktmp, MappedFS } from './util';

import { runCommand } from '../src/common';
import { mkdirAsync } from '../src/util/fs';

import { join } from 'path';

describe('Add: iOS', () => {
  let appDirObj;
  let FS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(20000);
    appDirObj = await makeAppDir();
    const appDir = appDirObj.appDir;
    // Init in this directory so we can test add
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    await run(appDir, `add ios`);
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should add', async () => {
    expect(await FS.exists('ios/')).toBe(true);
  });

  it('Should update Info.plist', async () => {
    const infoContent = await FS.read('ios/App/App/Info.plist');
    const regex = new RegExp(`<key>CFBundleDisplayName<\/key>[^<]*<string>${APP_NAME}<\/string>`);
    expect(regex.test(infoContent)).toBe(true);
  });

  it('Should update project.pbxproj', async () => {
    const pbxContent = await FS.read('ios/App/App.xcodeproj/project.pbxproj');
    const regex = new RegExp(`PRODUCT_BUNDLE_IDENTIFIER = ${APP_ID}`);
    expect(regex.test(pbxContent)).toBe(true);
  });

  // Other test ideas:
  // should install/copy pre-existing cordova/capacitor plugins in package.json
});