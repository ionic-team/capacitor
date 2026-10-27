import { join } from 'path';

import { runCommand } from '../src/util/subprocess';

import { APP_ID, APP_NAME, run, makeAppDir, MappedFS, installPlatform } from './util';

describe('Build: iOS', () => {
  let appDirObj: any;
  let FS: MappedFS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(1500000);
    appDirObj = await makeAppDir(false, false);
    const appDir = appDirObj.appDir;
    // Init in this directory so we can test build
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    await installPlatform(appDir, 'ios');
    // Build the template against this checkout, not the released tag, as it may use unreleased iOS APIs.
    await run(appDir, `add ios`, { CAPACITOR_IOS_PACKAGE: join(__dirname, '..', '..') });
    await runCommand(
      'xcodebuild',
      ['build', '-scheme', 'App', '-sdk', 'iphonesimulator', '-derivedDataPath', './build'],
      {
        cwd: join(appDir, 'ios', 'App'),
      },
    );
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should build', async () => {
    expect(await FS.exists('ios/App/build/Build/Products/Debug-iphonesimulator/App.app')).toBe(true);
  });
});
