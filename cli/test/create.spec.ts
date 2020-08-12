import { join } from 'path';
import { runCommand } from '../src/common';
import {
  APP_ID,
  APP_NAME,
  run,
  mktmp,
  MappedFS,
  installPlatform,
} from './util';

describe('Create', () => {
  let appDirObj: any;

  beforeAll(async () => {
    // These commands are slowww...
    jest.setTimeout(150000);
    appDirObj = await mktmp();
  });

  afterAll(() => {
    appDirObj.cleanupCallback();
  });

  it('Should create a project', async () => {
    const appDir = join(appDirObj.path, `test-app`);
    const FS = new MappedFS(appDir);
    await run(process.cwd(), `create "${appDir}" "${APP_NAME}" "${APP_ID}"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);
    await runCommand(`cd ${appDir} && npm install`);
    await installPlatform(appDir, 'ios');
    await run(appDir, 'add ios');
    expect(await FS.exists('ios')).toBe(true);
    await installPlatform(appDir, 'android');
    await run(appDir, 'add android');
    expect(await FS.exists('android')).toBe(true);
  });
});
