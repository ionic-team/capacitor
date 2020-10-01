import { exec } from 'child_process';
import { mkdirs } from 'fs-extra';
import { join, resolve } from 'path';
import type { DirCallback } from 'tmp';
import tmp from 'tmp';

import { runCommand } from '../src/common';
import { loadConfig } from '../src/config';
import type { Config } from '../src/definitions';
import {
  existsAsync,
  mkdirAsync,
  readFileAsync,
  writeFileAsync,
} from '../src/util/fs';

const cwd = process.cwd();

export const CORDOVA_PLUGIN_ID = 'cool-cordova-plugin';
export const APP_ID = 'com.getcapacitor.cli.test';
export const APP_NAME = 'Capacitor CLI Test';

export async function makeConfig(appRoot: string): Promise<Config> {
  process.chdir(appRoot);
  const config = await loadConfig();
  process.chdir(cwd);
  return config;
}

export async function run(
  appRoot: string,
  capCommand: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      `cd "${appRoot}" && "${cwd}/bin/capacitor" ${capCommand}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stdout + stderr);
        } else {
          resolve(stdout);
        }
      },
    );
  });
}

export function mktmp(): Promise<{
  cleanupCallback: DirCallback;
  path: string;
}> {
  return new Promise(resolve => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        throw err;
      }

      resolve({
        cleanupCallback,
        path,
      });
    });
  });
}

const APP_INDEX = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>Test Capacitor App</title>
</head>
<body>
  <capacitor-welcome></capacitor-welcome>
</body>
</html>
`;

const APP_PACKAGE_JSON = `
{
  "name": "test-app",
  "dependencies": {
    "${CORDOVA_PLUGIN_ID}": "latest"
  }
}
`;

export async function installPlatform(
  appDir: string,
  platform: string,
): Promise<void> {
  const platformPath = resolve(cwd, '..', platform);
  await runCommand(`cd ${appDir} && npm install ${platformPath}`);
}

export async function makeAppDir(monoRepoLike = false): Promise<void> {
  const appDirObj: any = await mktmp();
  const tmpDir = appDirObj.path;
  const rootDir = monoRepoLike
    ? join(tmpDir, 'test-root')
    : join(tmpDir, 'test-app');
  if (monoRepoLike) {
    await mkdirAsync(rootDir);
  }
  const appDir = monoRepoLike ? join(rootDir, 'test-app') : rootDir;
  await mkdirAsync(appDir);
  // Make the web dir
  await mkdirAsync(join(appDir, 'www'));
  // Make a fake index.html
  await writeFileAsync(join(appDir, 'www', 'index.html'), APP_INDEX);
  // Make a fake package.json
  await writeFileAsync(join(appDir, 'package.json'), APP_PACKAGE_JSON);

  // We use 'npm install' to install @capacitor/core and @capacitor/cli
  // Otherwise later use of 'npm install --save @capacitor/android|ios' will wipe 'node_modules/@capacitor/'
  const corePath = resolve(cwd, '../core');
  const cliPath = resolve(cwd, '../cli');
  await runCommand(
    `cd "${rootDir}" && npm install --save ${corePath} ${cliPath}`,
  );

  // Make a fake cordova plugin
  const cordovaPluginPath = join(tmpDir, CORDOVA_PLUGIN_ID);
  await makeCordovaPlugin(cordovaPluginPath);

  await runCommand(
    `cd "${rootDir}" && npm install --save ${cordovaPluginPath}`,
  );

  return {
    ...appDirObj,
    appDir,
  };
}

const CODOVA_PLUGIN_JS = `
var exec = require('cordova/exec');
var CoolPlugin = {
    doSomethingCool: function (doOverlay) {
        exec(null, null, "CoolPlugin", "doSomethingCool", []);
    }
};
module.exports = CoolPlugin;
`;

const CORDOVA_PLUGIN_XML = `
<?xml version="1.0" encoding="UTF-8"?>

<plugin xmlns="http://apache.org/cordova/ns/plugins/1.0"
    id="${CORDOVA_PLUGIN_ID}"
    version="1.0.20">
    <name>Cool Cordova Plugin</name>
    <js-module src="plugin.js" name="coolplugin">
        <clobbers target="window.CoolPlugin" />
    </js-module>
    <platform name="android">
        <config-file target="res/xml/config.xml" parent="/*">
            <feature name="CoolPlugin">
                <param name="android-package" value="com.getcapacitor.cordova.CoolPlugin"/>
            </feature>
        </config-file>
        <source-file src="android/com/getcapacitor/CoolPlugin.java" target-dir="src/com/getcapacitor/cordova" />
    </platform>
    <platform name="ios">
         <config-file target="config.xml" parent="/*">
             <feature name="CoolPlugin">
                 <param name="ios-package" value="CoolPlugin" />
             </feature>
         </config-file>
         <source-file src="src/ios/CoolPlugin.m" />
    </platform>
</plugin>
`;

const CORDOVA_PLUGIN_PACKAGE = `
{
  "name": "${CORDOVA_PLUGIN_ID}",
  "version": "0.0.1",
  "description": "Cool Cordova plugin",
  "cordova": {
    "id": "${CORDOVA_PLUGIN_ID}",
    "platforms": [
      "android",
      "ios"
    ]
  },
  "author": "Cap tester",
  "license": "MIT"
}
`;

async function makeCordovaPlugin(cordovaPluginPath: string) {
  const iosPath = join(cordovaPluginPath, 'src', 'ios');
  const androidPath = join(cordovaPluginPath, 'android/com/getcapacitor');
  await mkdirs(cordovaPluginPath);
  await writeFileAsync(join(cordovaPluginPath, 'plugin.js'), CODOVA_PLUGIN_JS);
  await writeFileAsync(
    join(cordovaPluginPath, 'plugin.xml'),
    CORDOVA_PLUGIN_XML,
  );
  await writeFileAsync(
    join(cordovaPluginPath, 'package.json'),
    CORDOVA_PLUGIN_PACKAGE,
  );
  await mkdirs(iosPath);
  await mkdirs(androidPath);
  await writeFileAsync(join(iosPath, 'CoolPlugin.m'), '');
  await writeFileAsync(join(androidPath, 'CoolPlugin.java'), '');
}

class MappedFS {
  constructor(private rootDir: string) {}
  async read(path: string): Promise<string> {
    return readFileAsync(resolve(this.rootDir, path), 'utf8');
  }
  async exists(path: string): Promise<boolean> {
    return existsAsync(resolve(this.rootDir, path));
  }
}

export { MappedFS };
