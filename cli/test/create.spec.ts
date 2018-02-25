import { run, mktmp, MappedFS } from './util';

import { join } from 'path';

const APP_ID = 'com.getcapacitor.cli.test';
const APP_NAME = 'Capacitor CLI Test';

describe('Create', () => {
  let appDirObj;
  let appDir;
  let FS;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(60000);
    appDirObj = await mktmp();
    appDir = join(appDirObj.path, 'test-app');
    FS = new MappedFS(appDir);
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should create a project', async () => {
    await run(process.cwd(), `create "${appDir}" "${APP_NAME}" "${APP_ID}"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);
    expect(await FS.exists('ios')).toBe(true);
    expect(await FS.exists('android')).toBe(true);
  });
});