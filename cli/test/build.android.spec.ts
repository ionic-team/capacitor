import { join } from 'path';

import { APP_ID, APP_NAME, run, makeAppDir, MappedFS, installPlatform } from './util';
import { runCommand } from '../src/util/subprocess';

describe('Build: Android', () => {
  let appDirObj: any;
  let FS: MappedFS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(150000);
    appDirObj = await makeAppDir(false);
    const appDir = appDirObj.appDir;
    // Init in this directory so we can test build
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    await installPlatform(appDir, 'android');
    await run(appDir, `add android`);
    await runCommand('./gradlew', ['assembleDebug'], {
      cwd: join(appDir, 'android'),
    });
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should build', async () => {
    expect(await FS.exists('android/app/build/outputs/apk/debug/app-debug.apk')).toBe(true);
  });
});
