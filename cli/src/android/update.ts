import { Config } from '../config';
import { log, runTask } from '../common';
import { Plugin, PluginType, getPlugins } from '../plugin';
import { getAndroidPlugins } from './common';
import { copyPluginsJS } from '../tasks/update';
import { ensureDirSync, removeSync, writeFileAsync } from '../util/fs';
import { join } from 'path';


export async function updateAndroid(config: Config, needsUpdate: boolean) {
  const plugins = await runTask('Fetching plugins', async () => {
    const allPlugins = await getPlugins();
    const androidPlugins = await getAndroidPlugins(allPlugins);
    return androidPlugins;
  });

  await copyPluginsJS(config, plugins, 'android');
  await autoGenerateConfig(config, plugins);
  await runTask(`Updating android`, async () => {
    log('\n');
    return Promise.resolve();
  });
}


export async function autoGenerateConfig(config: Config, plugins: Plugin[]) {
  const xmlDir = join(config.android.resDir, 'xml');
  ensureDirSync(xmlDir);
  const cordovaConfigXMLFile = join(xmlDir, 'config.xml');
  removeSync(cordovaConfigXMLFile);
  let pluginEntries: Array<any> = [];
  plugins.filter(p => p.android!.type === PluginType.Cordova).map( p => {
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
