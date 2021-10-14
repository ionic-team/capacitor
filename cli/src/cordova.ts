import {
  copy,
  ensureDir,
  mkdirp,
  pathExists,
  readFile,
  remove,
  writeFile,
} from '@ionic/utils-fs';
import { basename, extname, join, resolve } from 'path';
import plist from 'plist';
import type { PlistObject } from 'plist';
import prompts from 'prompts';

import { getAndroidPlugins } from './android/common';
import c from './colors';
import type { Config } from './definitions';
import { fatal } from './errors';
import { getIOSPlugins } from './ios/common';
import { logger, logPrompt } from './log';
import {
  PluginType,
  getAllElements,
  getAssets,
  getJSModules,
  getPlatformElement,
  getPluginPlatform,
  getPluginType,
  getPlugins,
  printPlugins,
} from './plugin';
import type { Plugin } from './plugin';
import { resolveNode } from './util/node';
import { isInteractive } from './util/term';
import { buildXmlElement, parseXML, readXML, writeXML } from './util/xml';

/**
 * Build the root cordova_plugins.js file referencing each Plugin JS file.
 */
export function generateCordovaPluginsJSFile(
  config: Config,
  plugins: Plugin[],
  platform: string,
): string {
  const pluginModules: any[] = [];
  const pluginExports: string[] = [];
  plugins.map(p => {
    const pluginId = p.xml.$.id;
    const jsModules = getJSModules(p, platform);
    jsModules.map((jsModule: any) => {
      const clobbers: string[] = [];
      const merges: string[] = [];
      let clobbersModule = '';
      let mergesModule = '';
      let runsModule = '';
      let clobberKey = '';
      let mergeKey = '';
      if (jsModule.clobbers) {
        jsModule.clobbers.map((clobber: any) => {
          clobbers.push(clobber.$.target);
          clobberKey = clobber.$.target;
        });
        clobbersModule = `,
        "clobbers": [
          "${clobbers.join('",\n          "')}"
        ]`;
      }
      if (jsModule.merges) {
        jsModule.merges.map((merge: any) => {
          merges.push(merge.$.target);
          mergeKey = merge.$.target;
        });
        mergesModule = `,
        "merges": [
          "${merges.join('",\n          "')}"
        ]`;
      }
      if (jsModule.runs) {
        runsModule = ',\n        "runs": true';
      }
      const pluginModule = {
        clobber: clobberKey,
        merge: mergeKey,
        // mimics Cordova's module name logic if the name attr is missing
        pluginContent: `{
          "id": "${
            pluginId +
            '.' +
            (jsModule.$.name || jsModule.$.src.match(/([^/]+)\.js/)[1])
          }",
          "file": "plugins/${pluginId}/${jsModule.$.src}",
          "pluginId": "${pluginId}"${clobbersModule}${mergesModule}${runsModule}
        }`,
      };
      pluginModules.push(pluginModule);
    });
    pluginExports.push(`"${pluginId}": "${p.xml.$.version}"`);
  });
  return `
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      ${pluginModules
        .sort(
          (a, b) =>
            a.clobber && b.clobber // Clobbers in alpha order
              ? a.clobber.localeCompare(b.clobber)
              : a.clobber || b.clobber // Clobbers before anything else
              ? b.clobber.localeCompare(a.clobber)
              : a.merge.localeCompare(b.merge), // Merges in alpha order
        )
        .map(e => e.pluginContent)
        .join(',\n      ')}
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      ${pluginExports.join(',\n      ')}
    };
    // BOTTOM OF METADATA
    });
    `;
}

/**
 * Build the plugins/* files for each Cordova plugin installed.
 */
export async function copyPluginsJS(
  config: Config,
  cordovaPlugins: Plugin[],
  platform: string,
): Promise<void> {
  const webDir = await getWebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  await removePluginFiles(config, platform);
  await Promise.all(
    cordovaPlugins.map(async p => {
      const pluginId = p.xml.$.id;
      const pluginDir = join(pluginsDir, pluginId, 'www');
      await ensureDir(pluginDir);
      const jsModules = getJSModules(p, platform);
      await Promise.all(
        jsModules.map(async (jsModule: any) => {
          const filePath = join(webDir, 'plugins', pluginId, jsModule.$.src);
          await copy(join(p.rootPath, jsModule.$.src), filePath);
          let data = await readFile(filePath, { encoding: 'utf-8' });
          data = data.trim();
          // mimics Cordova's module name logic if the name attr is missing
          const name =
            pluginId +
            '.' +
            (jsModule.$.name ||
              basename(jsModule.$.src, extname(jsModule.$.src)));
          data = `cordova.define("${name}", function(require, exports, module) { \n${data}\n});`;
          data = data.replace(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi,
            '',
          );
          await writeFile(filePath, data, { encoding: 'utf-8' });
        }),
      );
      const assets = getAssets(p, platform);
      await Promise.all(
        assets.map(async (asset: any) => {
          const filePath = join(webDir, asset.$.target);
          await copy(join(p.rootPath, asset.$.src), filePath);
        }),
      );
    }),
  );
  await writeFile(
    cordovaPluginsJSFile,
    generateCordovaPluginsJSFile(config, cordovaPlugins, platform),
  );
}

export async function copyCordovaJS(
  config: Config,
  platform: string,
): Promise<void> {
  const cordovaPath = resolveNode(
    config.app.rootDir,
    '@capacitor/core',
    'cordova.js',
  );
  if (!cordovaPath) {
    fatal(
      `Unable to find ${c.strong(
        'node_modules/@capacitor/core/cordova.js',
      )}.\n` + `Are you sure ${c.strong('@capacitor/core')} is installed?`,
    );
  }

  return copy(
    cordovaPath,
    join(await getWebDir(config, platform), 'cordova.js'),
  );
}

export async function createEmptyCordovaJS(
  config: Config,
  platform: string,
): Promise<void> {
  const webDir = await getWebDir(config, platform);
  await writeFile(join(webDir, 'cordova.js'), '');
  await writeFile(join(webDir, 'cordova_plugins.js'), '');
}

export async function removePluginFiles(
  config: Config,
  platform: string,
): Promise<void> {
  const webDir = await getWebDir(config, platform);
  const pluginsDir = join(webDir, 'plugins');
  const cordovaPluginsJSFile = join(webDir, 'cordova_plugins.js');
  await remove(pluginsDir);
  await remove(cordovaPluginsJSFile);
}

export async function autoGenerateConfig(
  config: Config,
  cordovaPlugins: Plugin[],
  platform: string,
): Promise<void> {
  let xmlDir = join(config.android.resDirAbs, 'xml');
  const fileName = 'config.xml';
  if (platform === 'ios') {
    xmlDir = config.ios.nativeTargetDirAbs;
  }
  await ensureDir(xmlDir);
  const cordovaConfigXMLFile = join(xmlDir, fileName);
  await remove(cordovaConfigXMLFile);
  const pluginEntries: any[] = [];
  cordovaPlugins.map(p => {
    const currentPlatform = getPluginPlatform(p, platform);
    if (currentPlatform) {
      const configFiles = currentPlatform['config-file'];
      if (configFiles) {
        const configXMLEntries = configFiles.filter(function (item: any) {
          return item.$?.target.includes(fileName);
        });
        configXMLEntries.map((entry: any) => {
          if (entry.feature) {
            const feature = { feature: entry.feature };
            pluginEntries.push(feature);
          }
        });
      }
    }
  });

  const pluginEntriesString: string[] = await Promise.all(
    pluginEntries.map(async (item): Promise<string> => {
      const xmlString = await writeXML(item);
      return xmlString;
    }),
  );
  let pluginPreferencesString: string[] = [];
  if (config.app.extConfig?.cordova?.preferences) {
    pluginPreferencesString = await Promise.all(
      Object.entries(config.app.extConfig.cordova.preferences).map(
        async ([key, value]): Promise<string> => {
          return `
  <preference name="${key}" value="${value}" />`;
        },
      ),
    );
  }
  const content = `<?xml version='1.0' encoding='utf-8'?>
<widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <access origin="*" />
  ${pluginEntriesString.join('')}
  ${pluginPreferencesString.join('')}
</widget>`;
  await writeFile(cordovaConfigXMLFile, content);
}

async function getWebDir(config: Config, platform: string): Promise<string> {
  if (platform === 'ios') {
    return config.ios.webDirAbs;
  }
  if (platform === 'android') {
    return config.android.webDirAbs;
  }
  return '';
}

export async function handleCordovaPluginsJS(
  cordovaPlugins: Plugin[],
  config: Config,
  platform: string,
): Promise<void> {
  const webDir = await getWebDir(config, platform);
  await mkdirp(webDir);

  if (cordovaPlugins.length > 0) {
    printPlugins(cordovaPlugins, platform, 'cordova');
    await copyCordovaJS(config, platform);
    await copyPluginsJS(config, cordovaPlugins, platform);
  } else {
    await removePluginFiles(config, platform);
    await createEmptyCordovaJS(config, platform);
  }
  await autoGenerateConfig(config, cordovaPlugins, platform);
}

export async function getCordovaPlugins(
  config: Config,
  platform: string,
): Promise<Plugin[]> {
  const allPlugins = await getPlugins(config, platform);
  let plugins: Plugin[] = [];
  if (platform === config.ios.name) {
    plugins = await getIOSPlugins(allPlugins);
  } else if (platform === config.android.name) {
    plugins = await getAndroidPlugins(allPlugins);
  }
  return plugins.filter(p => getPluginType(p, platform) === PluginType.Cordova);
}

export async function logCordovaManualSteps(
  cordovaPlugins: Plugin[],
  config: Config,
  platform: string,
): Promise<void> {
  cordovaPlugins.map(p => {
    const editConfig = getPlatformElement(p, platform, 'edit-config');
    const configFile = getPlatformElement(p, platform, 'config-file');
    editConfig.concat(configFile).map(async (configElement: any) => {
      if (configElement.$ && !configElement.$.target.includes('config.xml')) {
        if (platform === config.ios.name) {
          if (configElement.$.target.includes('Info.plist')) {
            logiOSPlist(configElement, config, p);
          }
        }
      }
    });
  });
}

async function logiOSPlist(configElement: any, config: Config, plugin: Plugin) {
  const plistPath = resolve(config.ios.nativeTargetDirAbs, 'Info.plist');
  const xmlMeta = await readXML(plistPath);
  const data = await readFile(plistPath, { encoding: 'utf-8' });
  const plistData = plist.parse(data) as PlistObject;
  const dict = xmlMeta.plist.dict.pop();
  if (!dict.key.includes(configElement.$.parent)) {
    let xml = buildConfigFileXml(configElement);
    xml = `<key>${configElement.$.parent}</key>${getConfigFileTagContent(xml)}`;
    logger.warn(
      `Configuration required for ${c.strong(plugin.id)}.\n` +
        `Add the following to Info.plist:\n` +
        xml,
    );
  } else if (configElement.array || configElement.dict) {
    if (
      configElement.array &&
      configElement.array.length > 0 &&
      configElement.array[0].string
    ) {
      let xml = '';
      configElement.array[0].string.map((element: any) => {
        const d = plistData[configElement.$.parent];
        if (Array.isArray(d) && !d.includes(element)) {
          xml = xml.concat(`<string>${element}</string>\n`);
        }
      });
      if (xml.length > 0) {
        logger.warn(
          `Configuration required for ${c.strong(plugin.id)}.\n` +
            `Add the following in the existing ${c.strong(
              configElement.$.parent,
            )} array of your Info.plist:\n` +
            xml,
        );
      }
    } else {
      logPossibleMissingItem(configElement, plugin);
    }
  }
}

function logPossibleMissingItem(configElement: any, plugin: Plugin) {
  let xml = buildConfigFileXml(configElement);
  xml = getConfigFileTagContent(xml);
  xml = removeOuterTags(xml);
  logger.warn(
    `Configuration might be missing for ${c.strong(plugin.id)}.\n` +
      `Add the following to the existing ${c.strong(
        configElement.$.parent,
      )} entry of Info.plist:\n` +
      xml,
  );
}

function buildConfigFileXml(configElement: any) {
  return buildXmlElement(configElement, 'config-file');
}

function getConfigFileTagContent(str: string) {
  return str.replace(/<config-file.+">|<\/config-file>/g, '');
}

function removeOuterTags(str: string) {
  const start = str.indexOf('>') + 1;
  const end = str.lastIndexOf('<');
  return str.substring(start, end);
}

export async function checkPluginDependencies(
  plugins: Plugin[],
  platform: string,
): Promise<void> {
  const pluginDeps: Map<string, string[]> = new Map();
  const cordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Cordova,
  );
  const incompatible = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Incompatible,
  );
  await Promise.all(
    cordovaPlugins.map(async p => {
      let allDependencies: string[] = [];
      allDependencies = allDependencies.concat(
        getPlatformElement(p, platform, 'dependency'),
      );
      if (p.xml['dependency']) {
        allDependencies = allDependencies.concat(p.xml['dependency']);
      }
      allDependencies = allDependencies.filter(
        (dep: any) =>
          !getIncompatibleCordovaPlugins(platform).includes(dep.$.id) &&
          incompatible.filter(p => p.id === dep.$.id || p.xml.$.id === dep.$.id)
            .length === 0,
      );
      if (allDependencies) {
        await Promise.all(
          allDependencies.map(async (dep: any) => {
            let plugin = dep.$.id;
            let version = dep.$.version;
            if (plugin.includes('@') && plugin.indexOf('@') !== 0) {
              [plugin, version] = plugin.split('@');
            }
            if (
              cordovaPlugins.filter(
                p => p.id === plugin || p.xml.$.id === plugin,
              ).length === 0
            ) {
              if (dep.$.url?.startsWith('http')) {
                plugin = dep.$.url;
                version = dep.$.commit;
              }
              const deps = pluginDeps.get(p.id) || [];
              deps.push(`${plugin}${version ? c.weak(` (${version})`) : ''}`);
              pluginDeps.set(p.id, deps);
            }
          }),
        );
      }
    }),
  );

  if (pluginDeps.size > 0) {
    let msg =
      `${c.failure(c.strong('Plugins are missing dependencies.'))}\n` +
      `Cordova plugin dependencies must be installed in your project (e.g. w/ ${c.input(
        'npm install',
      )}).\n`;
    for (const [plugin, deps] of pluginDeps.entries()) {
      msg +=
        `\n  ${c.strong(plugin)} is missing dependencies:\n` +
        deps.map(d => `    - ${d}`).join('\n');
    }

    logger.warn(`${msg}\n`);
  }
}

export function getIncompatibleCordovaPlugins(platform: string): string[] {
  const pluginList = [
    'cordova-plugin-splashscreen',
    'cordova-plugin-ionic-webview',
    'cordova-plugin-crosswalk-webview',
    'cordova-plugin-wkwebview-engine',
    'cordova-plugin-console',
    'cordova-plugin-music-controls',
    'cordova-plugin-add-swift-support',
    'cordova-plugin-ionic-keyboard',
    'cordova-plugin-braintree',
    '@ionic-enterprise/filesystem',
    '@ionic-enterprise/keyboard',
    '@ionic-enterprise/splashscreen',
    'cordova-support-google-services',
  ];
  if (platform === 'ios') {
    pluginList.push(
      'cordova-plugin-statusbar',
      '@ionic-enterprise/statusbar',
      'SalesforceMobileSDK-CordovaPlugin',
    );
  }
  if (platform === 'android') {
    pluginList.push('cordova-plugin-compat');
  }
  return pluginList;
}

export function needsStaticPod(plugin: Plugin): boolean {
  const pluginList = [
    'phonegap-plugin-push',
    '@havesource/cordova-plugin-push',
    'cordova-plugin-firebasex',
    '@batch.com/cordova-plugin',
  ];
  return pluginList.includes(plugin.id);
}

export async function getCordovaPreferences(config: Config): Promise<any> {
  const configXml = join(config.app.rootDir, 'config.xml');
  let cordova: any = {};
  if (await pathExists(configXml)) {
    cordova.preferences = {};
    const xmlMeta = await readXML(configXml);
    if (xmlMeta.widget.preference) {
      xmlMeta.widget.preference.map((pref: any) => {
        cordova.preferences[pref.$.name] = pref.$.value;
      });
    }
  }
  if (cordova.preferences && Object.keys(cordova.preferences).length > 0) {
    if (isInteractive()) {
      const answers = await logPrompt(
        `${c.strong(
          `Cordova preferences can be automatically ported to ${c.strong(
            config.app.extConfigName,
          )}.`,
        )}\n` +
          `Keep in mind: Not all values can be automatically migrated from ${c.strong(
            'config.xml',
          )}. There may be more work to do.\n` +
          `More info: ${c.strong(
            'https://capacitorjs.com/docs/cordova/migrating-from-cordova-to-capacitor',
          )}`,
        {
          type: 'confirm',
          name: 'confirm',
          message: `Migrate Cordova preferences from config.xml?`,
          initial: true,
        },
      );
      if (answers.confirm) {
        if (config.app.extConfig?.cordova?.preferences) {
          const answers = await prompts(
            [
              {
                type: 'confirm',
                name: 'confirm',
                message: `${config.app.extConfigName} already contains Cordova preferences. Overwrite?`,
              },
            ],
            { onCancel: () => process.exit(1) },
          );
          if (!answers.confirm) {
            cordova = config.app.extConfig?.cordova;
          }
        }
      } else {
        cordova = config.app.extConfig?.cordova;
      }
    }
  } else {
    cordova = config.app.extConfig?.cordova;
  }
  return cordova;
}

export async function writeCordovaAndroidManifest(
  cordovaPlugins: Plugin[],
  config: Config,
  platform: string,
): Promise<void> {
  const manifestPath = join(
    config.android.cordovaPluginsDirAbs,
    'src',
    'main',
    'AndroidManifest.xml',
  );
  const rootXMLEntries: any[] = [];
  const applicationXMLEntries: any[] = [];
  const applicationXMLAttributes: any[] = [];
  let prefsArray: any[] = [];
  cordovaPlugins.map(async p => {
    const editConfig = getPlatformElement(p, platform, 'edit-config');
    const configFile = getPlatformElement(p, platform, 'config-file');
    prefsArray = prefsArray.concat(getAllElements(p, platform, 'preference'));
    editConfig.concat(configFile).map(async (configElement: any) => {
      if (
        configElement.$ &&
        (configElement.$.target?.includes('AndroidManifest.xml') ||
          configElement.$.file?.includes('AndroidManifest.xml'))
      ) {
        const keys = Object.keys(configElement).filter(k => k !== '$');
        keys.map(k => {
          configElement[k].map((e: any) => {
            const xmlElement = buildXmlElement(e, k);
            const pathParts = getPathParts(
              configElement.$.parent || configElement.$.target,
            );
            if (pathParts.length > 1) {
              if (pathParts.pop() === 'application') {
                if (
                  configElement.$.mode &&
                  configElement.$.mode === 'merge' &&
                  xmlElement.startsWith('<application')
                ) {
                  Object.keys(e.$).map((ek: any) => {
                    applicationXMLAttributes.push(`${ek}="${e.$[ek]}"`);
                  });
                } else if (
                  !applicationXMLEntries.includes(xmlElement) &&
                  !contains(applicationXMLEntries, xmlElement, k)
                ) {
                  applicationXMLEntries.push(xmlElement);
                }
              } else {
                logger.warn(
                  `Configuration required for ${c.strong(p.id)}.\n` +
                    `Add the following to AndroidManifest.xml:\n` +
                    xmlElement,
                );
              }
            } else {
              if (
                !rootXMLEntries.includes(xmlElement) &&
                !contains(rootXMLEntries, xmlElement, k)
              ) {
                rootXMLEntries.push(xmlElement);
              }
            }
          });
        });
      }
    });
  });
  const cleartextString = 'android:usesCleartextTraffic="true"';
  const cleartext =
    config.app.extConfig.server?.cleartext &&
    !applicationXMLAttributes.includes(cleartextString)
      ? cleartextString
      : '';
  let content = `<?xml version='1.0' encoding='utf-8'?>
<manifest package="capacitor.android.plugins"
xmlns:android="http://schemas.android.com/apk/res/android"
xmlns:amazon="http://schemas.amazon.com/apk/res/android">
<application ${applicationXMLAttributes.join('\n')} ${cleartext}>
${applicationXMLEntries.join('\n')}
</application>
${rootXMLEntries.join('\n')}
</manifest>`;
  content = content.replace(
    new RegExp('$PACKAGE_NAME'.replace('$', '\\$&'), 'g'),
    '${applicationId}',
  );
  for (const preference of prefsArray) {
    content = content.replace(
      new RegExp(('$' + preference.$.name).replace('$', '\\$&'), 'g'),
      preference.$.default,
    );
  }
  if (await pathExists(manifestPath)) {
    await writeFile(manifestPath, content);
  }
}

function getPathParts(path: string) {
  const rootPath = 'manifest';
  path = path.replace('/*', rootPath);
  const parts = path.split('/').filter(part => part !== '');
  if (parts.length > 1 || parts.includes(rootPath)) {
    return parts;
  }
  return [rootPath, path];
}

function contains(entries: any[], obj: any, k: string) {
  const element = parseXML(obj);
  for (const entry of entries) {
    const current = parseXML(entry);
    if (
      element &&
      current &&
      current[k] &&
      element[k] &&
      current[k].$ &&
      element[k].$ &&
      element[k].$['android:name'] === current[k].$['android:name']
    ) {
      return true;
    }
  }
  return false;
}
