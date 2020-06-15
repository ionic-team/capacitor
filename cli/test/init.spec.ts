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
    jest.setTimeout(150000);
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
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client npm`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.bundledWebRuntime).toEqual(false);
    expect(jsonContents.webDir).toEqual('www');
  });

  it('Should init a project with webDir set', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client npm --web-dir="build"`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.bundledWebRuntime).toEqual(false);
    expect(jsonContents.webDir).toEqual('build');
  });

  it('Should init a project with webDir set', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client npm --web-dir=""`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.bundledWebRuntime).toEqual(false);
    expect(jsonContents.webDir).toEqual('www');
  });

  it('Should init a project with webDir passed without a value', async () => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client npm --web-dir`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.appId).toEqual(APP_ID);
    expect(jsonContents.appName).toEqual(APP_NAME);
    expect(jsonContents.bundledWebRuntime).toEqual(false);
    expect(jsonContents.webDir).toEqual('www');
  });

  it.each(['yarn', 'npm'])('Should set npm client (%s)', async (npmClient) => {
    await run(appDir, `init "${APP_NAME}" "${APP_ID}" --npm-client ${npmClient} --web-dir`);
    expect(await FS.exists('capacitor.config.json')).toBe(true);

    const fileContents = await FS.read('capacitor.config.json');
    const jsonContents = JSON.parse(fileContents);
    expect(jsonContents.npmClient).toEqual(npmClient);
  });
});
