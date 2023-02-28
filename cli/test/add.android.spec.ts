import {
  APP_ID,
  APP_NAME,
  run,
  makeAppDir,
  MappedFS,
  installPlatform,
} from './util';

let appDirObj: any;
let appDir: string;

describe.each([false, true])(
  'Add: Android (monoRepoLike: %p)',
  monoRepoLike => {

    beforeAll(async () => {
      // These commands are slowww...
      jest.setTimeout(150000);
      appDirObj = await makeAppDir(monoRepoLike);
      appDir = appDirObj.appDir;
      // Init in this directory so we can test add
      await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
      await installPlatform(appDir, 'android');
      await run(appDir, `add android`);
    });

    afterAll(() => {
      appDirObj.cleanupCallback();
    });

    it('Should add', async () => {
      const FS = new MappedFS(appDir);
      expect(await FS.exists('android/')).toBe(true);
    });

    it('Should have Cordova JS copied', async () => {
      const FS = new MappedFS(appDir);
      expect(
        await FS.exists('android/app/src/main/assets/public/cordova.js'),
      ).toBe(true);
      expect(
        await FS.exists(
          'android/app/src/main/assets/public/cordova_plugins.js',
        ),
      ).toBe(true);
    });

    it('Should rename package', async () => {
      const FS = new MappedFS(appDir);
      expect(
        await FS.exists(
          'android/app/src/main/java/com/getcapacitor/cli/test/MainActivity.java',
        ),
      ).toBe(true);
    });

    it('Should rename package in main activity', async () => {
      const FS = new MappedFS(appDir);
      const activityContent = await FS.read(
        'android/app/src/main/java/com/getcapacitor/cli/test/MainActivity.java',
      );
      const regex = new RegExp(`package ${APP_ID};`);
      expect(regex.test(activityContent)).toBe(true);
    });

    it('Should rename app id in build.gradle', async () => {
      const FS = new MappedFS(appDir);
      const gradleContent = await FS.read('android/app/build.gradle');
      const regex = new RegExp(`applicationId "${APP_ID}"`);
      expect(regex.test(gradleContent)).toBe(true);
    });

    it('Should update strings.xml', async () => {
      const FS = new MappedFS(appDir);
      const stringsContent = await FS.read(
        'android/app/src/main/res/values/strings.xml',
      );
      let regex = new RegExp(`<string name="app_name">${APP_NAME}</string>`);
      expect(regex.test(stringsContent)).toBe(true);
      regex = new RegExp(
        `<string name="title_activity_main">${APP_NAME}</string>`,
      );
      expect(regex.test(stringsContent)).toBe(true);
      regex = new RegExp(`<string name="custom_url_scheme">${APP_ID}</string>`);
      expect(regex.test(stringsContent)).toBe(true);
    });

    // Other test ideas:
    // should install/copy pre-existing cordova/capacitor plugins in package.json
  },
);
