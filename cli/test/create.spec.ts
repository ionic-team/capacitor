import { APP_ID, APP_NAME, run, mktmp, MappedFS } from './util';

import { join } from 'path';

describe('Create', () => {
  let appDirObj;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(150000);
    appDirObj = await mktmp();
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it.each(['npm', 'yarn'])('Should create a project with %s', async (npmClient) => {
    const appDir = join(appDirObj.path, `test-app-${npmClient}`);
    const FS = new MappedFS(appDir);
    await run(process.cwd(), `create "${appDir}" "${APP_NAME}" "${APP_ID}" --npm-client ${npmClient}`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);
    await run(appDir, 'add ios');
    expect(await FS.exists('ios')).toBe(true);
    await run(appDir, 'add android');
    expect(await FS.exists('android')).toBe(true);
    const lockFileMap = {
      npm: 'package-lock.json',
      yarn: 'yarn.lock'
    };
    expect(await FS.exists(lockFileMap[npmClient])).toBe(true);
  });
});