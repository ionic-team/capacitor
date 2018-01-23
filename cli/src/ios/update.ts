import { checkCocoaPods, checkIOSProject, getIOSPlugins } from './common';
import { CheckFunction, log, logInfo, runCommand, runTask } from '../common';
import { writeFileAsync, readFileAsync, copySync, ensureDirSync, removeSync } from '../util/fs';
import { Config } from '../config';
import { join } from 'path';
import { Plugin, PluginType, getPlugins, printPlugins } from '../plugin';


export const updateIOSChecks: CheckFunction[] = [checkCocoaPods, checkIOSProject];


export async function updateIOS(config: Config, needsUpdate: boolean) {

  var chalk = require('chalk');
  log(`\n${chalk.bold('iOS Note:')} you should periodically run "pod repo update" to make sure your ` +
          `local Pod repo is up to date and can find new Pod releases.\n`);

  const inquirer = await import('inquirer');
  const answers = await inquirer.prompt([{
    type: 'input',
    name: 'updateRepo',
    message: `Run "pod repo update" to make sure you have the latest Pods available before updating (takes a few minutes)?`,
    default: 'n'
  }]);

  if (answers.updateRepo) {
    await runTask(`Running pod repo update to update CocoaPods`, () => {
      return runCommand(`pod repo update`);
    });
  }

  const plugins = await runTask('Fetching plugins', async () => {
    const allPlugins = await getPlugins();
    const iosPlugins = await getIOSPlugins(allPlugins);
    return iosPlugins;
  });

  //printPlugins(plugins);
  await copyPluginsJS(config, plugins, "ios");
  await autoGeneratePods(plugins);
  await installCocoaPodsPlugins(config, plugins, needsUpdate);
}

export async function copyPluginsJS(config: Config, plugins: Plugin[], platform: string) {
  const pluginsDir = join(config.ios.webDir, 'plugins');
  const cordovaPluginsJSFile = join(config.ios.webDir, 'cordova_plugins.js');
  removeSync(pluginsDir);
  removeSync(cordovaPluginsJSFile);
  plugins.filter(p => p.ios!.type === PluginType.Cordova).map(async p => {
    const pluginDir = join(pluginsDir, p.id, 'www');
    ensureDirSync(pluginDir);
    const jsModules = getJSModules(p, platform);
    jsModules.map(async (jsModule: any) => {
      const filePath = join(config.ios.webDir, 'plugins', p.id, jsModule.$.src);
      copySync(join(p.rootPath, jsModule.$.src), filePath);
      let data = await readFileAsync(filePath, 'utf8');
      data = `cordova.define("${p.id}.${jsModule.$.name}", function(require, exports, module) { \n${data}\n});`;
      await writeFileAsync(filePath, data, 'utf8');
    });
  });
  writeFileAsync(cordovaPluginsJSFile, generateCordovaPluginsJSFile(config, plugins, platform));
}

export async function autoGeneratePods(plugins: Plugin[]): Promise<void[]> {
  return Promise.all(plugins
    .filter(p => p.ios!.type !== PluginType.Cocoapods)
    .map(async p => {
      const name = p.ios!.name = p.name;
      p.ios!.type = PluginType.Cocoapods;
      const content = generatePodspec(name);
      const path = join(p.rootPath, p.ios!.path, name + '.podspec');
      return writeFileAsync(path, content);
    }));
}


export function generatePodspec(name: string) {
  return `
  Pod::Spec.new do |s|
    s.name = '${name}'
    s.version = '0.0.1'
    s.summary = 'Autogenerated spec'
    s.license = 'Unknown'
    s.homepage = 'https://example.com'
    s.authors = { 'Capacitor generator' => 'hi@ionicframework.com' }
    s.source = { :git => 'https://github.com/ionic-team/capacitor.git', :tag => '0.0.1' }
    s.source_files = '*.{swift,h,m}'
    s.dependency 'CapacitorCordova'
  end`;
}


export async function installCocoaPodsPlugins(config: Config, plugins: Plugin[], needsUpdate: boolean) {
  const pods = plugins
    .filter(p => p.ios!.type === PluginType.Cocoapods);

  await runTask('Updating iOS native dependencies', () => {
    return updatePodfile(config, pods, needsUpdate);
  });
}


export async function updatePodfile(config: Config, plugins: Plugin[], needsUpdate: boolean) {
  const content = generatePodFile(config, plugins);
  const projectName = config.ios.nativeProjectName;
  const podfilePath = join(config.ios.name, projectName, 'Podfile');

  await writeFileAsync(podfilePath, content, 'utf8');

  if (needsUpdate) {
    await runCommand(`cd ${config.ios.name} && cd ${projectName} && pod update && xcodebuild -project App.xcodeproj clean`);
  } else {
    log('Not doing pod update');
    await runCommand(`cd ${config.ios.name} && cd ${projectName} && pod install && xcodebuild -project App.xcodeproj clean`);
  }
}


export function generatePodFile(config: Config, plugins: Plugin[]) {
  const pods = plugins
    .map((p) => `pod '${p.ios!.name}', :path => '../../node_modules/${p.id}/${p.ios!.path}'`);

  return `
    # DO NOT MODIFY.
    # This Podfile was autogenerated by the Capacitor CLI.
    # It is used to resolve the native dependencies of Capacitor plugins.

    platform :ios, '${config.ios.minVersion}'
    use_frameworks!

    target 'App' do
      ${config.ios.capacitorRuntimePod}
      ${pods.join('\n')}
    end`;
}

export function generateCordovaPluginsJSFile(config: Config, plugins: Plugin[], platform: string) {
  let pluginModules: Array<string> = [];
  let pluginExports: Array<string> = [];
  plugins.map((p) => {
    const jsModules = getJSModules(p, platform);
      jsModules.map((jsModule: any) => {
      let clobbers: Array<string> = [];
      jsModule.clobbers.map((clobber: any)=> {
        clobbers.push(clobber.$.target);
      });
      pluginModules.push(`{
        "id": "${p.id}.${jsModule.$.name}",
        "file": "plugins/${p.id}/${jsModule.$.src}",
        "pluginId": "${p.id}",
        "clobbers": [
          "${clobbers.join(',')}"
        ]}`
      );
    });
    pluginExports.push(`"${p.id}": "${p.xml.$.version}"`);
  });
  return `
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      ${pluginModules.join(',')}
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      ${pluginExports.join(',')}
    };
    // BOTTOM OF METADATA
    });
    `;
}

function getJSModules(p: Plugin, platform: string) {
  const modules: Array<string> = p.xml["js-module"];
  const platformModules = p.xml.platform.filter(function(item: any) { return item.$.name === platform; });
  return modules.concat(platformModules[0]["js-module"]);
}