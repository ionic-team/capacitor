import { APP_ID, APP_NAME, CORDOVA_PLUGIN_ID, MappedFS, makeAppDir, makeConfig, run } from './util';
import { updateCommand } from '../src/tasks/update';

describe.each([false, true])('Update: iOS (monoRepoLike: %p)', (monoRepoLike) => {
  let appDirObj;
  let appDir;
  let FS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(120000);
    appDirObj = await makeAppDir(monoRepoLike);
    appDir = appDirObj.appDir;
    // Init in this directory so we can test add
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client npm`);
    await run(appDir, `add ios`);
    // Redundant, because add does this, but called explicitly for thoroughness
    await updateCommand(makeConfig(appDir), 'ios', false);
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    //appDirObj.cleanupCallback();
  });

  it('Should update', async () => {
  });

  it('Should install Cordova plugin JS', async () => {
    const cordovaPluginJSContent = await FS.read('ios/App/public/cordova_plugins.js');
    let regex = new RegExp(CORDOVA_PLUGIN_ID);
    expect(regex.test(cordovaPluginJSContent)).toBe(true);
  });

  // Other test ideas:
  // should install/copy pre-existing cordova/capacitor plugins in package.json
});
