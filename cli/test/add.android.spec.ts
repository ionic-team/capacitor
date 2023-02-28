import {
  APP_ID,
  APP_NAME,
  run,
  makeAppDir,
  MappedFS,
  installPlatform,
} from './util';

describe.each([false, true])(
  'Add: Android (monoRepoLike: %p)',
  monoRepoLike => {
    let appDirObj: any;
    let FS: MappedFS;

    beforeAll(async () => {
      // These commands are slowww...
      jest.setTimeout(150000);
      console.log('1');
      appDirObj = await makeAppDir(monoRepoLike);
      console.log('2');
      const appDir = appDirObj.appDir;
      console.log('3');
      // Init in this directory so we can test add
      await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
      console.log('4');
      await installPlatform(appDir, 'android');
      console.log('5');
      await run(appDir, `add android`);
      console.log('6');
      FS = new MappedFS(appDir);
      console.log('7');
    });

    afterAll(() => {
      appDirObj.cleanupCallback();
    });

    it('Should add', async () => {
      console.log(FS);
      expect(await FS.exists('android/')).toBe(true);
    });

    it('Should have Cordova JS copied', async () => {
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
      expect(
        await FS.exists(
          'android/app/src/main/java/com/getcapacitor/cli/test/MainActivity.java',
        ),
      ).toBe(true);
    });

    it('Should rename package in main activity', async () => {
      const activityContent = await FS.read(
        'android/app/src/main/java/com/getcapacitor/cli/test/MainActivity.java',
      );
      const regex = new RegExp(`package ${APP_ID};`);
      expect(regex.test(activityContent)).toBe(true);
    });

    it('Should rename app id in build.gradle', async () => {
      const gradleContent = await FS.read('android/app/build.gradle');
      const regex = new RegExp(`applicationId "${APP_ID}"`);
      expect(regex.test(gradleContent)).toBe(true);
    });

    it('Should update strings.xml', async () => {
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
