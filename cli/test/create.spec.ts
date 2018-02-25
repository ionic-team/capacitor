import { run, mktmp, read, existsWithRoot } from './util';

import { join } from 'path';

const APP_ID = 'com.getcapacitor.cli.test';
const APP_NAME = 'Capacitor CLI Test';

describe('CLI Create', () => {
  let appDirObj;
  let appDir;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(60000);
    appDirObj = await mktmp();
    appDir = join(appDirObj.path, 'test-app');
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should create a project', async () => {
    await run(process.cwd(), `create "${appDir}" "${APP_NAME}" "${APP_ID}"`);
    const exists = existsWithRoot(appDir);
    expect(await exists('capacitor.config.json')).toBe(true);
    expect(await exists('ios')).toBe(true);
    expect(await exists('android')).toBe(true);
  });
});