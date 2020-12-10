import {
  copy,
  remove,
  pathExists,
  readdirp,
  readFile,
  writeFile,
  writeJSON,
} from '@ionic/utils-fs';
import Debug from 'debug';
import { dirname, extname, join, relative, resolve } from 'path';

import c from '../colors';
import { checkPlatformVersions, runTask } from '../common';
import {
  checkPluginDependencies,
  handleCordovaPluginsJS,
  writeCordovaAndroidManifest,
} from '../cordova';
import type { Config } from '../definitions';
import { logFatal } from '../log';
import type { Plugin } from '../plugin';
import {
  PluginType,
  getAllElements,
  getFilePath,
  getPlatformElement,
  getPluginPlatform,
  getPluginType,
  getPlugins,
  printPlugins,
} from '../plugin';
import { convertToUnixPath } from '../util/fs';
import { resolveNode } from '../util/node';
import { extractTemplate } from '../util/template';

import { getAndroidPlugins } from './common';

const platform = 'android';
const debug = Debug('capacitor:android:update');

export async function updateAndroid(config: Config): Promise<void> {
  const plugins = await getPluginsTask(config);

  const capacitorPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Core,
  );

  printPlugins(capacitorPlugins, 'android');

  await writePluginsJson(config, capacitorPlugins);
  await removePluginsNativeFiles(config);
  const cordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Cordova,
  );
  if (cordovaPlugins.length > 0) {
    await copyPluginsNativeFiles(config, cordovaPlugins);
  }
  await handleCordovaPluginsJS(cordovaPlugins, config, platform);
  await checkPluginDependencies(plugins, platform);
  await installGradlePlugins(config, capacitorPlugins, cordovaPlugins);
  await handleCordovaPluginsGradle(config, cordovaPlugins);
  await writeCordovaAndroidManifest(cordovaPlugins, config, platform);

  const incompatibleCordovaPlugins = plugins.filter(
    p => getPluginType(p, platform) === PluginType.Incompatible,
  );
  printPlugins(incompatibleCordovaPlugins, platform, 'incompatible');
  await checkPlatformVersions(config, platform);
}

function getGradlePackageName(id: string): string {
  return id.replace('@', '').replace('/', '-');
}

interface PluginsJsonEntry {
  pkg: string;
  classpath: string;
}

async function writePluginsJson(
  config: Config,
  plugins: Plugin[],
): Promise<void> {
  const classes = await findAndroidPluginClasses(plugins);
  const pluginsJsonPath = resolve(
    config.android.assetsDirAbs,
    'capacitor.plugins.json',
  );

  await writeJSON(pluginsJsonPath, classes, { spaces: '\t' });
}

async function findAndroidPluginClasses(
  plugins: Plugin[],
): Promise<PluginsJsonEntry[]> {
  const entries: PluginsJsonEntry[] = [];

  for (const plugin of plugins) {
    entries.push(...(await findAndroidPluginClassesInPlugin(plugin)));
  }

  return entries;
}

async function findAndroidPluginClassesInPlugin(
  plugin: Plugin,
): Promise<PluginsJsonEntry[]> {
  if (!plugin.android || getPluginType(plugin, platform) !== PluginType.Core) {
    return [];
  }

  const srcPath = resolve(plugin.rootPath, plugin.android.path, 'src/main');
  const srcFiles = await readdirp(srcPath, {
    filter: entry =>
      !entry.stats.isDirectory() &&
      ['.java', '.kt'].includes(extname(entry.path)),
  });

  const classRegex = /^@(?:CapacitorPlugin|NativePlugin)[\s\S]+?class ([\w]+)/gm;
  const packageRegex = /^package ([\w.]+);?$/gm;

  debug(
    'Searching %O source files in %O by %O regex',
    srcFiles.length,
    srcPath,
    classRegex,
  );

  const entries = await Promise.all(
    srcFiles.map(
      async (srcFile): Promise<PluginsJsonEntry | undefined> => {
        const srcFileContents = await readFile(srcFile, { encoding: 'utf-8' });
        const classMatch = classRegex.exec(srcFileContents);

        if (classMatch) {
          const className = classMatch[1];

          debug('Searching %O for package by %O regex', srcFile, packageRegex);

          const packageMatch = packageRegex.exec(
            srcFileContents.substring(0, classMatch.index),
          );

          if (!packageMatch) {
            logFatal(
              `Package could not be parsed from Android plugin.\n` +
                `Location: ${c.strong(srcFile)}`,
            );
          }

          const packageName = packageMatch[1];
          const classpath = `${packageName}.${className}`;

          debug('%O is a suitable plugin class', classpath);

          return {
            pkg: plugin.id,
            classpath,
          };
        }
      },
    ),
  );

  return entries.filter((entry): entry is PluginsJsonEntry => !!entry);
}

export async function installGradlePlugins(
  config: Config,
  capacitorPlugins: Plugin[],
  cordovaPlugins: Plugin[],
): Promise<void> {
  const capacitorAndroidPackagePath = resolveNode(
    config.app.rootDir,
    '@capacitor/android',
    'package.json',
  );
  if (!capacitorAndroidPackagePath) {
    logFatal(
      `Unable to find node_modules/@capacitor/android\n` +
        `Are you sure ${c.strong('@capacitor/android')} is installed?`,
    );
  }

  const capacitorAndroidPath = resolve(
    dirname(capacitorAndroidPackagePath),
    'capacitor',
  );

  const settingsPath = config.android.platformDirAbs;
  const dependencyPath = config.android.appDirAbs;
  const relativeCapcitorAndroidPath = convertToUnixPath(
    relative(settingsPath, capacitorAndroidPath),
  );
  const settingsLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('${relativeCapcitorAndroidPath}')
${capacitorPlugins
  .map(p => {
    const relativePluginPath = convertToUnixPath(
      relative(settingsPath, p.rootPath),
    );
    return `
include ':${getGradlePackageName(p.id)}'
project(':${getGradlePackageName(
      p.id,
    )}').projectDir = new File('${relativePluginPath}/${p.android!.path}')
`;
  })
  .join('')}`;

  const applyArray: any[] = [];
  const frameworksArray: any[] = [];
  let prefsArray: any[] = [];
  cordovaPlugins.map(p => {
    const relativePluginPath = convertToUnixPath(
      relative(dependencyPath, p.rootPath),
    );
    const frameworks = getPlatformElement(p, platform, 'framework');
    frameworks.map((framework: any) => {
      if (
        framework.$.custom &&
        framework.$.custom === 'true' &&
        framework.$.type &&
        framework.$.type === 'gradleReference'
      ) {
        applyArray.push(
          `apply from: "${relativePluginPath}/${framework.$.src}"`,
        );
      } else if (!framework.$.type && !framework.$.custom) {
        frameworksArray.push(`    implementation "${framework.$.src}"`);
      }
    });
    prefsArray = prefsArray.concat(getAllElements(p, platform, 'preference'));
  });
  let frameworkString = frameworksArray.join('\n');
  frameworkString = await replaceFrameworkVariables(
    config,
    prefsArray,
    frameworkString,
  );
  const dependencyLines = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN

android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
  }
}

apply from: "../capacitor-cordova-android-plugins/cordova.variables.gradle"
dependencies {
${capacitorPlugins
  .map(p => {
    return `    implementation project(':${getGradlePackageName(p.id)}')`;
  })
  .join('\n')}
${frameworkString}
}
${applyArray.join('\n')}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
`;

  await writeFile(
    join(settingsPath, 'capacitor.settings.gradle'),
    settingsLines,
  );
  await writeFile(
    join(dependencyPath, 'capacitor.build.gradle'),
    dependencyLines,
  );
}

export async function handleCordovaPluginsGradle(
  config: Config,
  cordovaPlugins: Plugin[],
): Promise<void> {
  const pluginsGradlePath = join(
    config.android.cordovaPluginsDirAbs,
    'build.gradle',
  );
  const frameworksArray: any[] = [];
  let prefsArray: any[] = [];
  const applyArray: any[] = [];
  applyArray.push(`apply from: "cordova.variables.gradle"`);
  cordovaPlugins.map(p => {
    const relativePluginPath = convertToUnixPath(
      relative(config.android.cordovaPluginsDirAbs, p.rootPath),
    );
    const frameworks = getPlatformElement(p, platform, 'framework');
    frameworks.map((framework: any) => {
      if (!framework.$.type && !framework.$.custom) {
        frameworksArray.push(framework.$.src);
      } else if (
        framework.$.custom &&
        framework.$.custom === 'true' &&
        framework.$.type &&
        framework.$.type === 'gradleReference'
      ) {
        applyArray.push(
          `apply from: "${relativePluginPath}/${framework.$.src}"`,
        );
      }
    });
    prefsArray = prefsArray.concat(getAllElements(p, platform, 'preference'));
  });
  let frameworkString = frameworksArray
    .map(f => {
      return `    implementation "${f}"`;
    })
    .join('\n');
  frameworkString = await replaceFrameworkVariables(
    config,
    prefsArray,
    frameworkString,
  );
  const applyString = applyArray.join('\n');
  let buildGradle = await readFile(pluginsGradlePath, { encoding: 'utf-8' });
  buildGradle = buildGradle.replace(
    /(SUB-PROJECT DEPENDENCIES START)[\s\S]*(\/\/ SUB-PROJECT DEPENDENCIES END)/,
    '$1\n' + frameworkString.concat('\n') + '    $2',
  );
  buildGradle = buildGradle.replace(
    /(PLUGIN GRADLE EXTENSIONS START)[\s\S]*(\/\/ PLUGIN GRADLE EXTENSIONS END)/,
    '$1\n' + applyString.concat('\n') + '$2',
  );
  await writeFile(pluginsGradlePath, buildGradle);
  const cordovaVariables = `// DO NOT EDIT THIS FILE! IT IS GENERATED EACH TIME "capacitor update" IS RUN
ext {
  cdvMinSdkVersion = project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : ${config.android.minVersion}
  // Plugin gradle extensions can append to this to have code run at the end.
  cdvPluginPostBuildExtras = []
}`;
  await writeFile(
    join(config.android.cordovaPluginsDirAbs, 'cordova.variables.gradle'),
    cordovaVariables,
  );
}

async function copyPluginsNativeFiles(
  config: Config,
  cordovaPlugins: Plugin[],
) {
  const pluginsPath = join(config.android.cordovaPluginsDirAbs, 'src', 'main');
  for (const p of cordovaPlugins) {
    const androidPlatform = getPluginPlatform(p, platform);
    if (androidPlatform) {
      const sourceFiles = androidPlatform['source-file'];
      if (sourceFiles) {
        for (const sourceFile of sourceFiles) {
          const fileName = sourceFile.$.src.split('/').pop();
          let baseFolder = 'java/';
          if (fileName.split('.').pop() === 'aidl') {
            baseFolder = 'aidl/';
          }
          const target = sourceFile.$['target-dir']
            .replace('app/src/main/', '')
            .replace('src/', baseFolder);
          await copy(
            getFilePath(config, p, sourceFile.$.src),
            join(pluginsPath, target, fileName),
          );
        }
      }
      const resourceFiles = androidPlatform['resource-file'];
      if (resourceFiles) {
        for (const resourceFile of resourceFiles) {
          const target = resourceFile.$['target'];
          if (resourceFile.$.src.split('.').pop() === 'aar') {
            await copy(
              getFilePath(config, p, resourceFile.$.src),
              join(pluginsPath, 'libs', target.split('/').pop()),
            );
          } else if (target !== '.') {
            await copy(
              getFilePath(config, p, resourceFile.$.src),
              join(pluginsPath, target),
            );
          }
        }
      }
      const libFiles = getPlatformElement(p, platform, 'lib-file');
      for (const libFile of libFiles) {
        await copy(
          getFilePath(config, p, libFile.$.src),
          join(pluginsPath, 'libs', libFile.$.src.split('/').pop()),
        );
      }
    }
  }
}

async function removePluginsNativeFiles(config: Config) {
  await remove(config.android.cordovaPluginsDirAbs);
  await extractTemplate(
    config.cli.assets.android.cordovaPluginsTemplateArchiveAbs,
    config.android.cordovaPluginsDirAbs,
  );
}

async function getPluginsTask(config: Config) {
  return await runTask('Updating Android plugins', async () => {
    const allPlugins = await getPlugins(config, 'android');
    const androidPlugins = await getAndroidPlugins(allPlugins);
    return androidPlugins;
  });
}

async function replaceFrameworkVariables(
  config: Config,
  prefsArray: any[],
  frameworkString: string,
) {
  const variablesFile = resolve(
    config.android.platformDirAbs,
    'variables.gradle',
  );
  let variablesGradle = '';
  if (await pathExists(variablesFile)) {
    variablesGradle = await readFile(variablesFile, { encoding: 'utf-8' });
  }
  prefsArray.map((preference: any) => {
    if (!variablesGradle.includes(preference.$.name)) {
      frameworkString = frameworkString.replace(
        new RegExp(('$' + preference.$.name).replace('$', '\\$&'), 'g'),
        preference.$.default,
      );
    }
  });
  return frameworkString;
}
