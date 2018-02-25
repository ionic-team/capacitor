import { run, mktmp, read, existsWithRoot } from './util';

const APP_ID = 'com.getcapacitor.cli.test';
const APP_NAME = 'Capacitor CLI Test';

describe('CLI Init/Create', () => {
  let appDirObj;
  let appDir;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(60000);
    appDirObj = await mktmp('test-app');
    appDir = appDirObj.path;
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should create a project', async () => {
    await run(`create "${appDir}" "${APP_NAME}" "${APP_ID}"`);
    const exists = existsWithRoot(appDir);
    console.log('EXISTS: ', exists);
    expect(await exists('capacitor.config.json')).toBe(true);
    expect(await exists('ios')).toBe(true);
    expect(await exists('android')).toBe(true);
  });
});