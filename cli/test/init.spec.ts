import { mkdir } from '@ionic/utils-fs';
import { join } from 'path';

import { APP_ID, APP_NAME, run, mktmp, MappedFS } from './util';

describe('Init', () => {
  let appDirObj: any;
  let tmpDir: string;
  let appDir: string;
  let FS: MappedFS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(150000);
    appDirObj = await mktmp();
    tmpDir = appDirObj.path;
    appDir = join(tmpDir, 'test-app');
    await mkdir(appDir);
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should init a project', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.webDir).toEqual('www');
  });

  it('Should init a project with webDir set', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --web-dir="build"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.webDir).toEqual('build');
  });
});
