import { APP_ID, APP_NAME, CORDOVA_PLUGIN_ID, MappedFS, makeAppDir, makeConfig, mktmp, run } from './util';

import { runCommand } from '../src/common';
import { updateCommand } from '../src/tasks/update';
import { mkdirAsync, writeFileAsync } from '../src/util/fs';

import { join } from 'path';


describe('Update: iOS', () => {
  let appDirObj;
  let appDir;
  let FS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(20000);
    appDirObj = await makeAppDir();
    appDir = appDirObj.appDir;
    // Init in this directory so we can test add
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    await run(appDir, `add ios`);
    // Redundant, because add does this, but called explicitly for thoroughness
    await updateCommand(makeConfig(appDir), 'ios');
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    //appDirObj.cleanupCallback();
  });

  it('Should update', async () => {
  });

  it('Should install Cordova plugin JS', async () => {
    console.log(appDir);
    const cordovaPluginJSContent = await FS.read('ios/App/public/cordova_plugins.js');
    console.log(cordovaPluginJSContent);
    let regex = new RegExp(CORDOVA_PLUGIN_ID);
    expect(regex.test(cordovaPluginJSContent)).toBe(true);
  });

  // Other test ideas:
  // should install/copy pre-existing cordova/capacitor plugins in package.json
});
