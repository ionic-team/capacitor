import { existsAsync, mkdirAsync, readFileAsync, writeFileAsync, cpAsync } from '../src/util/fs';
import { Config } from '../src/config';
import { exec } from 'child_process';
import { join, resolve } from 'path';
import { mkdirs } from 'fs-extra';
const tmp = require('tmp');

const cwd = process.cwd();

export const CORDOVA_PLUGIN_ID = 'cool-cordova-plugin';
export const APP_ID = 'com.getcapacitor.cli.test';
export const APP_NAME = 'Capacitor CLI Test';

export function makeConfig(appRoot: string): Config {
  return new Config(process.platform, appRoot, `${cwd}/bin`);
}

export async function run(appRoot: string, capCommand: string) {
  return new Promise((resolve, reject) => {
    exec(`cd ${appRoot} && ${cwd}/bin/cap ${capCommand}`, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function mktmp() {
  return new Promise((resolve, reject) => {
    tmp.dir((err, path, cleanupCallback) => {
      if (err) {
        throw err;
      }

      resolve({
        cleanupCallback,
        path
      });
    });
  });
}

const APP_PACKAGE_JSON = `
{
  "name": "test-app",
  "dependencies": {
    "${CORDOVA_PLUGIN_ID}": "latest"
  }
}
`

export async function makeAppDir() {
  const appDirObj: any = await mktmp();
  const tmpDir = appDirObj.path;
  const appDir = join(tmpDir, 'test-app');
  await mkdirAsync(appDir);
  // Make the web dir
  await mkdirAsync(join(appDir, 'www'));
  // Make a fake package.json
  await writeFileAsync(join(appDir, 'package.json'), APP_PACKAGE_JSON);
  await mkdirAsync(join(appDir, 'node_modules'));
  const cliModulesPath = join(appDir, 'node_modules/@capacitor/cli');
  const coreModulesPath = join(appDir, 'node_modules/@capacitor/core');
  await mkdirs(cliModulesPath);
  await mkdirs(coreModulesPath);
  await cpAsync(join(cwd, 'dist'), cliModulesPath);
  await cpAsync(resolve(cwd, '../core/dist'), coreModulesPath);
  await cpAsync(resolve(cwd, '../core/native-bridge.js'), join(coreModulesPath, 'native-bridge.js'));
  await cpAsync(resolve(cwd, '../core/cordova.js'), join(coreModulesPath, 'cordova.js'));

  // Make a fake cordova plugin
  await makeCordovaPlugin(appDir);

  return {
    ...appDirObj,
     appDir
  };
}

const CORDOVA_PLUGIN_XML = `
<?xml version="1.0" encoding="UTF-8"?>

<plugin xmlns="http://apache.org/cordova/ns/plugins/1.0"
    id="${CORDOVA_PLUGIN_ID}"
    version="1.0.20">
    <name>Cool Cordova Plugin</name>
</plugin>
`;
const CORDOVA_PLUGIN_PACKAGE = `
{
  "name": "${CORDOVA_PLUGIN_ID}",
  "cordova": {
    "id": "${CORDOVA_PLUGIN_ID}",
    "platforms": [
      "android",
      "ios"
    ]
  }
}
`;

const CORDOVA_PLUGINS_PODSPEC = `
Pod::Spec.new do |s|
  s.name = 'CordovaPluginsResources'
  s.version = '0.0.105'
  s.summary = 'Resources for Cordova plugins'
  s.social_media_url = 'http://twitter.com/getcapacitor'
  s.license = 'MIT'
  s.homepage = 'https://capacitor.ionicframework.com/'
  s.authors = { 'Ionic Team' => 'hi@ionicframework.com' }
  s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => s.version.to_s }
  s.resources = ['resources/*']
end
`;

async function makeCordovaPlugin(appDir: string) {
  const cordovaPluginPath = join(appDir, `node_modules/${CORDOVA_PLUGIN_ID}`);
  const iosPath = join(cordovaPluginPath, 'ios');
  const androidPath = join(cordovaPluginPath, 'android/com/getcapacitor/cordova');
  await mkdirs(cordovaPluginPath);
  await writeFileAsync(join(cordovaPluginPath, 'plugin.xml'), CORDOVA_PLUGIN_XML);
  await writeFileAsync(join(cordovaPluginPath, 'package.json'), CORDOVA_PLUGIN_PACKAGE);
  await mkdirs(iosPath);
  await mkdirs(androidPath);
  await writeFileAsync(join(iosPath, 'CoolPlugin.m'), '');
  await writeFileAsync(join(androidPath, 'CoolPlugin.java'), '');
  const cliAssetsCordova = join(appDir, 'node_modules/@capacitor/cli/assets/capacitor-cordova-ios-plugins');
  await mkdirs(cliAssetsCordova);
  await writeFileAsync(join(cliAssetsCordova, 'CordovaPluginsResources.podspec'), CORDOVA_PLUGINS_PODSPEC);
}

class MappedFS {
  constructor(private rootDir) {
  }
  async read (path) {
    return readFileAsync(resolve(this.rootDir, path), 'utf8');
  }
  async exists(path) {
    return existsAsync(resolve(this.rootDir, path));
  }
}

export { MappedFS };
