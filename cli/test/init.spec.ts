import { APP_ID, APP_NAME, run, mktmp, MappedFS } from './util';

import { mkdirAsync } from '../src/util/fs';

import { join } from 'path';

describe('Init', () => {
  let appDirObj;
  let tmpDir;
  let appDir;
  let FS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(20000);
    appDirObj = await mktmp();
    tmpDir = appDirObj.path;
    appDir = join(tmpDir, 'test-app');
    await mkdirAsync(appDir);
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should init a project', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);
  });
});