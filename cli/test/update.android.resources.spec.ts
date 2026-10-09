import { APP_ID, APP_NAME, MappedFS, makeAppDir, run, installPlatform } from './util';
import { join } from 'path';
import { mkdirp, writeFile } from 'fs-extra';
import { runCommand } from '../src/util/subprocess';

const CAPACITOR_PLUGIN_ID = 'capacitor-resource-plugin';
const CAPACITOR_PLUGIN_JS = `
module.exports = {
  echo: function(options) {
    return Promise.resolve(options);
  }
};
`;

const CAPACITOR_PLUGIN_XML = `
<?xml version="1.0" encoding="UTF-8"?>
<plugin xmlns="http://apache.org/cordova/ns/plugins/1.0"
    id="${CAPACITOR_PLUGIN_ID}"
    version="1.0.0">
    <name>Capacitor Resource Plugin</name>
    <platform name="android">
        <resource-file src="android/src/main/res/xml/automotive_app_desc.xml" target="res/xml/automotive_app_desc.xml" />
    </platform>
</plugin>
`;

const CAPACITOR_PLUGIN_PACKAGE = `
{
  "name": "${CAPACITOR_PLUGIN_ID}",
  "version": "1.0.0",
  "description": "Capacitor Resource Plugin",
  "capacitor": {
    "android": {
      "src": "android"
    }
  },
  "main": "plugin.js"
}
`;

const AUTOMOTIVE_APP_DESC = `
<?xml version="1.0" encoding="utf-8"?>
<automotiveApp>
    <uses name="media"/>
</automotiveApp>
`;

async function makeCapacitorPlugin(pluginPath: string) {
    const androidPath = join(pluginPath, 'android/src/main');
    const resPath = join(androidPath, 'res/xml');
    await mkdirp(resPath);
    await writeFile(join(pluginPath, 'plugin.js'), CAPACITOR_PLUGIN_JS);
    await writeFile(join(pluginPath, 'plugin.xml'), CAPACITOR_PLUGIN_XML);
    await writeFile(join(pluginPath, 'package.json'), CAPACITOR_PLUGIN_PACKAGE);
    await writeFile(join(resPath, 'automotive_app_desc.xml'), AUTOMOTIVE_APP_DESC);

    // Create dummy android project structure for the plugin so it looks valid
    await writeFile(join(androidPath, 'AndroidManifest.xml'), '<manifest></manifest>');
}

describe('Update: Android Resources', () => {
    let appDirObj: any;
    let appDir: string;
    let FS: MappedFS;

    beforeAll(async () => {
        jest.setTimeout(150000);
        appDirObj = await makeAppDir();
        appDir = appDirObj.appDir;

        // Create and install custom capacitor plugin
        const pluginPath = join(appDirObj.path, CAPACITOR_PLUGIN_ID);
        await makeCapacitorPlugin(pluginPath);

        await runCommand('npm', ['install', '--save', pluginPath], {
            cwd: appDir,
        });

        await run(appDir, `init "${APP_NAME}" "${APP_ID}"`);
        await installPlatform(appDir, 'android');
        await run(appDir, `add android`);
        FS = new MappedFS(appDir);
    });

    afterAll(() => {
        //appDirObj.cleanupCallback();
    });

    it('Should copy resource-file from Capacitor plugin', async () => {
        // Run update to trigger the copy
        await run(appDir, `update android`);

        const resourcePath = 'android/capacitor-cordova-android-plugins/src/main/res/xml/automotive_app_desc.xml';
        const exists = await FS.exists(resourcePath);
        expect(exists).toBe(true);

        if (exists) {
            const content = await FS.read(resourcePath);
            expect(content).toContain('<uses name="media"/>');
        }
    });
});
