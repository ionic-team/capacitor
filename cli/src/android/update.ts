import { Config } from '../config';
import { log, runTask } from '../common';
import { Plugin, PluginType, getPlugins } from '../plugin';
import { getAndroidPlugins } from './common';
import { copyCordovaJS, copyPluginsJS, createEmptyCordovaJS, getPluginType, removePluginFiles } from '../tasks/update';
import { copySync, ensureDirSync, removeSync, writeFileAsync } from '../util/fs';
import { join, resolve } from 'path';

const platform = 'android';

export async function updateAndroid(config: Config, needsUpdate: boolean) {
  const plugins = await runTask('Fetching plugins', async () => {
    const allPlugins = await getPlugins();
    const androidPlugins = await getAndroidPlugins(allPlugins);
    return androidPlugins;
  });

  const cordovaPlugins = plugins
    .filter(p => getPluginType(p, platform) === PluginType.Cordova);
  if (cordovaPlugins.length > 0) {
    await copyCordovaJS(config, platform);
    await copyPluginsJS(config, cordovaPlugins, platform);
    copyPluginsNativeFiles(config, cordovaPlugins);
  } else {    
    removePluginFiles(config, platform);
    createEmptyCordovaJS(config, platform);
  }
  await autoGenerateConfig(config, cordovaPlugins);
  await runTask(`Updating android`, async () => {
    log('\n');
    return Promise.resolve();
  });
}


export async function autoGenerateConfig(config: Config, cordovaPlugins: Plugin[]) {
  const xmlDir = join(config.android.resDir, 'xml');
  ensureDirSync(xmlDir);
  const cordovaConfigXMLFile = join(xmlDir, 'config.xml');
  removeSync(cordovaConfigXMLFile);
  let pluginEntries: Array<any> = [];
  cordovaPlugins.map( p => {
    const androidPlatform = p.xml.platform.filter(function(item: any) { return item.$.name === 'android'; });
    const androidConfigFiles = androidPlatform[0]['config-file'];
    if (androidConfigFiles) {
      const configXMLEntries = androidConfigFiles.filter(function(item: any) { return item.$.target === 'res/xml/config.xml'; });
      configXMLEntries.map(  (entry: any)  => {
        const feature = { feature: entry.feature };
        pluginEntries.push(feature);
      });
    }
  });

  const pluginEntriesString: Array<string> = await Promise.all(pluginEntries.map(async (item): Promise<string> => {
    const xmlString = await writeXML(item);
    return xmlString;
  }));
  const content = `<?xml version='1.0' encoding='utf-8'?>
  <widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  ${pluginEntriesString.join('\n')}
  </widget>`;
  writeFileAsync(cordovaConfigXMLFile, content);
}


export function writeXML(object: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const xml2js = await import('xml2js');
    const builder = new xml2js.Builder({ headless: true, explicitRoot: false, rootName: 'deleteme' });
    let xml = builder.buildObject(object);
    xml = xml.replace('<deleteme>', '').replace('</deleteme>', '');
    resolve(xml);
  });
}

function copyPluginsNativeFiles(config: Config, cordovaPlugins: Plugin[]) {
  const pluginsPath = resolve('node_modules', '@capacitor/cli', 'assets', 'capacitor-android-plugins', 'src', 'main');
  removeSync(join(pluginsPath, 'java'));
  removeSync(join(pluginsPath, 'res'));
  cordovaPlugins.map( p => {
    const platformFiles = p.xml.platform.filter(function(item: any) { return item.$.name === platform; });
    const sourceFiles = platformFiles[0]['source-file'];
    sourceFiles.map( (sourceFile: any) => {
      const fileName = sourceFile.$.src.split("/").pop();
      const target = sourceFile.$["target-dir"].replace('src/', 'java/');
      copySync(join(p.rootPath, sourceFile.$.src), join(pluginsPath, target, fileName));
    });
    const resourceFiles = platformFiles[0]['resource-file'];
    resourceFiles.map( (resourceFile: any) => {
      copySync(join(p.rootPath, resourceFile.$.src), join(pluginsPath, resourceFile.$["target"]));
    });
  });
}
