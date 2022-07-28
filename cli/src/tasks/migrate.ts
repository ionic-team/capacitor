import { writeFileSync, readFileSync, existsSync } from '@ionic/utils-fs';
import { join } from 'path';
import rimraf from 'rimraf';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger, logPrompt, logSuccess } from '../log';
import { deleteFolderRecursive } from '../util/fs';
import { getCommandOutput } from '../util/subprocess';
import { extractTemplate } from '../util/template';
import { readXML } from '../util/xml';

// eslint-disable-next-line prefer-const
let allDependencies: { [key: string]: any } = {};
const libs = [
  '@capacitor/core',
  '@capacitor/cli',
  '@capacitor/ios',
  '@capacitor/android',
];
const plugins = [
  '@capacitor/action-sheet',
  '@capacitor/app',
  '@capacitor/app-launcher',
  '@capacitor/browser',
  '@capacitor/camera',
  '@capacitor/clipboard',
  '@capacitor/device',
  '@capacitor/dialog',
  '@capacitor/filesystem',
  '@capacitor/geolocation',
  '@capacitor/google-maps',
  '@capacitor/haptics',
  '@capacitor/keyboard',
  '@capacitor/local-notifications',
  '@capacitor/motion',
  '@capacitor/network',
  '@capacitor/push-notifications',
  '@capacitor/screen-reader',
  '@capacitor/share',
  '@capacitor/splash-screen',
  '@capacitor/status-bar',
  '@capacitor/text-zoom',
  '@capacitor/toast',
];
const coreVersion = '^4.0.0';
const pluginVersion = '^4.0.0';

export async function migrateCommand(config: Config): Promise<void> {
  if (config === null) {
    fatal('Config data missing');
  }

  const variablesAndClasspaths:
    | {
        'variables': any;
        'com.android.tools.build:gradle': string;
        'com.google.gms:google-services': string;
      }
    | undefined = await getAndroidVarriablesAndClasspaths(config);

  if (!variablesAndClasspaths) {
    fatal('Variable and Classpath info could not be read.');
  }

  //*

  allDependencies = {
    ...config.app.package.dependencies,
    ...config.app.package.devDependencies,
  };

  const monorepoWarning =
    'Please note this tool is not intended for use in a mono-repo enviroment, please check out the Ionic vscode extension for this functionality.';

  logger.info(monorepoWarning);

  const { migrateconfirm } = await logPrompt(
    `Capacitor 4 sets a deployment target of iOS 13 and Android 12 (SDK 32). \n`,
    {
      type: 'text',
      name: 'migrateconfirm',
      message: `Are you sure you want to migrate? (Y/n)`,
      initial: 'y',
    },
  );

  if (
    typeof migrateconfirm === 'string' &&
    migrateconfirm.toLowerCase() === 'y'
  ) {
    try {
      const { npmInstallConfirm } = await logPrompt(
        `Would you like the migrator to run npm install to install the latest versions of capacitor packages? (Those using other package managers should answer N)`,
        {
          type: 'text',
          name: 'npmInstallConfirm',
          message: `Run Npm Install? (Y/n)`,
          initial: 'y',
        },
      );
      const runNpmInstall =
        typeof npmInstallConfirm === 'string' &&
        npmInstallConfirm.toLowerCase() === 'y';

      await runTask(`Installing Latest NPM Modules.`, () => {
        return installLatestNPMLibs(runNpmInstall, config);
      });

      await runTask(
        `Migrating @capacitor/storage to @capacitor/preferences.`,
        () => {
          return migrateStoragePluginToPreferences(runNpmInstall);
        },
      );

      if (
        allDependencies['@capacitor/ios'] &&
        existsSync(config.ios.platformDirAbs)
      ) {
        // Set deployment target to 13.0
        await runTask(`Migrating deployment target to 13.0.`, () => {
          return updateFile(
            config,
            join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj'),
            'IPHONEOS_DEPLOYMENT_TARGET = ',
            ';',
            '13.0',
          );
        });

        // Update Podfile to 13.0
        await runTask(`Migrating Podfile to 13.0.`, () => {
          return updateFile(
            config,
            join(config.ios.nativeProjectDirAbs, 'Podfile'),
            `platform :ios, '`,
            `'`,
            '13.0',
          );
        });

        await runTask(`Migrating Podfile to use post_install script.`, () => {
          return podfileAssertDeploymentTarget(
            join(config.ios.nativeProjectDirAbs, 'Podfile'),
          );
        });

        // Remove touchesBegan
        await runTask(
          `Migrating AppDelegate.swift by removing touchesBegan.`,
          () => {
            return updateFile(
              config,
              join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift'),
              `override func touchesBegan`,
              `}`,
              undefined,
              true,
            );
          },
        );

        // Remove NSAppTransportSecurity
        await runTask(
          `Migrating Info.plist by removing NSAppTransportSecurity key.`,
          () => {
            return removeKey(
              join(config.ios.nativeTargetDirAbs, 'Info.plist'),
              'NSAppTransportSecurity',
            );
          },
        );

        // Remove USE_PUSH
        await runTask(`Migrating by removing USE_PUSH.`, () => {
          return replacePush(
            join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj'),
          );
        });

        // Remove from App Delegate
        await runTask(`Migrating App Delegate.`, () => {
          return replaceIfUsePush(config);
        });
      }

      if (
        allDependencies['@capacitor/android'] &&
        existsSync(config.android.platformDirAbs)
      ) {
        // AndroidManifest.xml add attribute: <activity android:exported="true"
        await runTask(
          `Migrating AndroidManifest.xml by adding android:exported attribute to Activity.`,
          () => {
            return updateAndroidManifest(
              join(config.android.srcMainDirAbs, 'AndroidManifest.xml'),
            );
          },
        );

        // Update build.gradle
        const { leaveJCenterPrompt } = await logPrompt(
          `Some projects still require JCenter to function. If your project does, please answer yes below.`,
          {
            type: 'text',
            name: 'leaveJCenterPrompt',
            message: `Keep JCenter if present? (y/N)`,
            initial: 'n',
          },
        );
        await runTask(`Migrating build.gradle file.`, () => {
          return updateBuildGradle(
            join(config.android.platformDirAbs, 'build.gradle'),
            typeof leaveJCenterPrompt === 'string' &&
              leaveJCenterPrompt.toLowerCase() === 'y',
            variablesAndClasspaths,
          );
        });

        // Update app.gradle
        await runTask(`Migrating app/build.gradle file.`, () => {
          return updateAppBuildGradle(
            join(config.android.appDirAbs, 'build.gradle'),
          );
        });

        // Update gradle-wrapper.properties
        await runTask(
          `Migrating gradle-wrapper.properties by updating gradle version from 7.0 to 7.4.2.`,
          () => {
            return updateGradleWrapper(
              join(
                config.android.platformDirAbs,
                'gradle',
                'wrapper',
                'gradle-wrapper.properties',
              ),
            );
          },
        );

        // Variables gradle
        await runTask(`Migrating variables.gradle file.`, () => {
          return (async (): Promise<void> => {
            for (const variable of Object.keys(
              variablesAndClasspaths.variables,
            )) {
              if (
                !(await updateFile(
                  config,
                  join(config.android.platformDirAbs, 'variables.gradle'),
                  `${variable} = '`,
                  `'`,
                  variablesAndClasspaths.variables[variable].toString(),
                  true,
                ))
              ) {
                const didWork = await updateFile(
                  config,
                  join(config.android.platformDirAbs, 'variables.gradle'),
                  `${variable} = `,
                  `\n`,
                  variablesAndClasspaths.variables[variable].toString(),
                  true,
                );
                if (!didWork) {
                  let file = readFile(
                    join(config.android.platformDirAbs, 'variables.gradle'),
                  );
                  if (file) {
                    file = file.replace(
                      '}',
                      `    ${variable} = '${variablesAndClasspaths.variables[
                        variable
                      ].toString()}'\n}`,
                    );
                    writeFileSync(
                      join(config.android.platformDirAbs, 'variables.gradle'),
                      file,
                    );
                  }
                }
              }
            }
          })();
        });

        // remove init
        await runTask('Migrating MainActivity by removing init().', () => {
          return removeOldInitAndroid(config);
        });

        rimraf.sync(join(config.android.appDirAbs, 'build'));

        // add new splashscreen
        await runTask('Migrate to Android 12 Splashscreen.', () => {
          return addNewSplashScreen(config);
        });
      }

      // Run Cap Sync
      await runTask(`Running cap sync.`, () => {
        return getCommandOutput('npx', ['cap', 'sync']);
      });

      // Write all breaking changes
      await runTask(`Writing breaking changes.`, () => {
        return writeBreakingChanges();
      });

      logSuccess(
        `Migration to Capacitor ${coreVersion} is complete. Run and test your app!`,
      );
    } catch (err) {
      fatal(`Failed to migrate: ${err}`);
    }
  } else {
    fatal(`User canceled migration.`);
  }
  //*/
}

async function installLatestNPMLibs(runInstall: boolean, config: Config) {
  const pkgJsonPath = join(config.app.rootDir, 'package.json');
  const pkgJsonFile = readFile(pkgJsonPath);
  if (!pkgJsonFile) {
    return;
  }
  const pkgJson: any = JSON.parse(pkgJsonFile);

  for (const devDepKey of Object.keys(pkgJson['devDependencies'])) {
    if (libs.includes(devDepKey)) {
      pkgJson['devDependencies'][devDepKey] = coreVersion;
    } else if (plugins.includes(devDepKey)) {
      pkgJson['devDependencies'][devDepKey] = pluginVersion;
    }
  }
  for (const depKey of Object.keys(pkgJson['dependencies'])) {
    if (libs.includes(depKey)) {
      pkgJson['dependencies'][depKey] = coreVersion;
    } else if (plugins.includes(depKey)) {
      pkgJson['dependencies'][depKey] = pluginVersion;
    }
  }

  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), {
    encoding: 'utf-8',
  });

  if (runInstall) {
    rimraf.sync(join(config.app.rootDir, 'package-lock.json'));
    rimraf.sync(join(config.app.rootDir, 'node_modules/@capacitor/!(cli)'));
    await getCommandOutput('npm', ['i']);
  } else {
    logger.info(
      `Please run an install command with your package manager of choice. (ex: yarn install)`,
    );
  }
}

async function migrateStoragePluginToPreferences(runInstall: boolean) {
  if (allDependencies['@capacitor/storage']) {
    logger.info(
      'NOTE: @capacitor/storage was renamed to @capacitor/preferences, please be sure to replace occurances in your code.',
    );
    if (runInstall) {
      await getCommandOutput('npm', ['uninstall', '@capacitor/storage']);
      await getCommandOutput('npm', [
        'i',
        `@capacitor/preferences@${pluginVersion}`,
      ]);
    } else {
      logger.info(
        `Please manually uninstall @capacitor/storage and replace it with @capacitor/preferences@${pluginVersion}`,
      );
    }
  }
}

async function writeBreakingChanges() {
  const breaking = [
    '@capacitor/storage',
    '@capacitor/camera',
    '@capacitor/push-notifications',
    '@capacitor/local-notifications',
  ];
  const broken = [];
  for (const lib of breaking) {
    if (allDependencies[lib]) {
      broken.push(lib);
    }
  }
  if (broken.length > 0) {
    logger.info(
      `IMPORTANT: Review https://capacitorjs.com/docs/updating/4-0#plugins for breaking changes in these plugins that you use: ${broken.join(
        ', ',
      )}.`,
    );
  }
  if (allDependencies['@capacitor/android']) {
    logger.info(
      'Warning: The Android Gradle plugin was updated and it requires Java 11 to run. You may need to select this in Android Studio.',
    );
  }
}

async function updateAndroidManifest(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }

  const hasAndroidExportedAlreadySet = new RegExp(
    /<activity([^>]*(android:exported=")[^>]*)>/g,
  ).test(txt);
  let isAndroidExportedSetToFalse = false;
  if (hasAndroidExportedAlreadySet) {
    isAndroidExportedSetToFalse = new RegExp(
      /<activity([^>]*(android:exported="false")[^>]*)>/g,
    ).test(txt);
  }

  // AndroidManifest.xml add attribute: <activity android:exported="true"
  if (hasAndroidExportedAlreadySet && !isAndroidExportedSetToFalse) {
    return; // Probably already updated manually
  }
  let replaced = txt;
  if (!hasAndroidExportedAlreadySet) {
    replaced = setAllStringIn(
      txt,
      '<activity',
      ' ',
      `\n            android:exported="true"\n`,
    );
  } else {
    logger.info(
      `Found 'android:exported="false"' in your AndroidManifest.xml, if this is not intentional please update it manually to "true".`,
    );
  }
  if (txt == replaced) {
    logger.error(`Unable to update Android Manifest. Missing <activity> tag`);
    return;
  }
  writeFileSync(filename, replaced, 'utf-8');
}

async function updateBuildGradle(
  filename: string,
  leaveJCenter: boolean,
  variablesAndClasspaths: {
    'variables': any;
    'com.android.tools.build:gradle': string;
    'com.google.gms:google-services': string;
  },
) {
  // In build.gradle add dependencies:
  // classpath 'com.android.tools.build:gradle:7.2.1'
  // classpath 'com.google.gms:google-services:4.3.10'
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  const neededDeps: { [key: string]: string } = {
    'com.android.tools.build:gradle':
      variablesAndClasspaths['com.android.tools.build:gradle'],
    'com.google.gms:google-services':
      variablesAndClasspaths['com.google.gms:google-services'],
  };
  let replaced = txt;

  for (const dep of Object.keys(neededDeps)) {
    if (!replaced.includes(`classpath '${dep}`)) {
      replaced = txt.replace(
        'dependencies {',
        `dependencies {\n        classpath '${dep}:${neededDeps[dep]}'`,
      );
    } else {
      // Update
      replaced = setAllStringIn(
        replaced,
        `classpath '${dep}:`,
        `'`,
        neededDeps[dep],
      );
      logger.info(`Set ${dep} = ${neededDeps[dep]}.`);
    }
  }

  // Replace jcenter()
  const lines = replaced.split('\n');
  let inRepositories = false;
  let hasMavenCentral = false;
  let final = '';
  for (const line of lines) {
    if (line.includes('repositories {')) {
      inRepositories = true;
      hasMavenCentral = false;
    } else if (line.trim() == '}') {
      // Make sure we have mavenCentral()
      if (inRepositories && !hasMavenCentral) {
        final += '        mavenCentral()\n';
        logger.info(`Added mavenCentral().`);
      }
      inRepositories = false;
    }
    if (inRepositories && line.trim() === 'mavenCentral()') {
      hasMavenCentral = true;
    }
    if (inRepositories && line.trim() === 'jcenter()' && !leaveJCenter) {
      // skip jCentral()
      logger.info(`Removed jcenter().`);
    } else {
      final += line + '\n';
    }
  }

  if (txt !== final) {
    writeFileSync(filename, final, 'utf-8');
    return;
  }
}

async function getAndroidVarriablesAndClasspaths(config: Config) {
  const tempAndroidTemplateFolder = join(
    config.cli.assetsDirAbs,
    'tempAndroidTemplate',
  );
  await extractTemplate(
    config.cli.assets.android.platformTemplateArchiveAbs,
    tempAndroidTemplateFolder,
  );
  const variablesGradleFile = readFile(
    join(tempAndroidTemplateFolder, 'variables.gradle'),
  );
  const buildGradleFile = readFile(
    join(tempAndroidTemplateFolder, 'build.gradle'),
  );
  if (!variablesGradleFile || !buildGradleFile) {
    return;
  }
  deleteFolderRecursive(tempAndroidTemplateFolder);

  const firstIndxOfCATBGV =
    buildGradleFile.indexOf(`classpath 'com.android.tools.build:gradle:`) + 42;
  const firstIndxOfCGGGS =
    buildGradleFile.indexOf(`com.google.gms:google-services:`) + 31;
  const comAndroidToolsBuildGradleVersion =
    '' +
    buildGradleFile.substring(
      firstIndxOfCATBGV,
      buildGradleFile.indexOf("'", firstIndxOfCATBGV),
    );
  const comGoogleGmsGoogleServices =
    '' +
    buildGradleFile.substring(
      firstIndxOfCGGGS,
      buildGradleFile.indexOf("'", firstIndxOfCGGGS),
    );

  const variablesGradleAsJSON = JSON.parse(
    variablesGradleFile
      .replace('ext ', '')
      .replace(/=/g, ':')
      .replace(/\n/g, ',')
      .replace(/,([^:]+):/g, function (_k, p1) {
        return `,"${p1}":`;
      })
      .replace('{,', '{')
      .replace(',}', '}')
      .replace(/\s/g, '')
      .replace(/'/g, '"'),
  );

  return {
    'variables': variablesGradleAsJSON,
    'com.android.tools.build:gradle': comAndroidToolsBuildGradleVersion,
    'com.google.gms:google-services': comGoogleGmsGoogleServices,
  };
}

function readFile(filename: string): string | undefined {
  try {
    if (!existsSync(filename)) {
      logger.error(`Unable to find ${filename}. Try updating it manually`);
      return;
    }
    return readFileSync(filename, 'utf-8');
  } catch (err) {
    logger.error(
      `Unable to read ${filename}. Verify it is not already open. ${err}`,
    );
  }
}

async function updateAppBuildGradle(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  if (!txt.includes('androidx.coordinatorlayout:coordinatorlayout:')) {
    replaced = replaced.replace(
      'dependencies {',
      'dependencies {\n    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"',
    );
  }
  if (!txt.includes('androidx.core:core-splashscreen:')) {
    replaced = replaced.replace(
      'dependencies {',
      'dependencies {\n    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"',
    );
  }
  // const lines = txt.split('\n');
  if (replaced !== txt) {
    writeFileSync(filename, replaced, 'utf-8');
  }
}

async function updateGradleWrapper(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  const replaced = setAllStringIn(
    txt,
    'distributionUrl=',
    '\n',
    // eslint-disable-next-line no-useless-escape
    `https\://services.gradle.org/distributions/gradle-7.4.2-bin.zip`,
  );
  writeFileSync(filename, replaced, 'utf-8');
}

async function updateFile(
  config: Config,
  filename: string,
  textStart: string,
  textEnd: string,
  replacement?: string,
  skipIfNotFound?: boolean,
): Promise<boolean> {
  if (config === null) {
    return false;
  }
  const path = filename;
  let txt = readFile(path);
  if (!txt) {
    return false;
  }
  if (txt.includes(textStart)) {
    if (replacement) {
      txt = setAllStringIn(txt, textStart, textEnd, replacement);
      writeFileSync(path, txt, { encoding: 'utf-8' });
    } else {
      // Replacing in code so we need to count the number of brackets to find the end of the function in swift
      const lines = txt.split('\n');
      let replaced = '';
      let keep = true;
      let brackets = 0;
      for (const line of lines) {
        if (line.includes(textStart)) {
          keep = false;
        }
        if (!keep) {
          brackets += (line.match(/{/g) || []).length;
          brackets -= (line.match(/}/g) || []).length;
          if (brackets == 0) {
            keep = true;
          }
        } else {
          replaced += line + '\n';
        }
      }
      writeFileSync(path, replaced, { encoding: 'utf-8' });
    }
    return true;
  } else if (!skipIfNotFound) {
    logger.error(
      `Unable to find "${textStart}" in ${filename}. Try updating it manually`,
    );
  }

  return false;
}

function setAllStringIn(
  data: string,
  start: string,
  end: string,
  replacement: string,
): string {
  let position = 0;
  let result = data;
  let replaced = true;
  while (replaced) {
    const foundIdx = result.indexOf(start, position);
    if (foundIdx == -1) {
      replaced = false;
    } else {
      const idx = foundIdx + start.length;
      position = idx + replacement.length;
      result =
        result.substring(0, idx) +
        replacement +
        result.substring(result.indexOf(end, idx));
    }
  }
  return result;
}

async function replaceIfUsePush(config: Config) {
  const startLine = '#if USE_PUSH';
  const endLine = '#endif';
  const filename = join(config.ios.nativeTargetDirAbs, 'AppDelegate.swift');
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  const lines = txt.split('\n');
  let startLineIndex: number | null = null;
  let endLineIndex: number | null = null;
  for (const [key, item] of lines.entries()) {
    if (item.includes(startLine)) {
      startLineIndex = key;
      break;
    }
  }
  if (startLineIndex !== null) {
    for (const [key, item] of lines.entries()) {
      if (item.includes(endLine) && key > startLineIndex) {
        endLineIndex = key;
        break;
      }
    }
    if (endLineIndex !== null) {
      lines[endLineIndex] = '';
      lines[startLineIndex] = '';
      writeFileSync(filename, lines.join('\n'), 'utf-8');
    }
  }
}

async function replacePush(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  replaced = replaced.replace('DEBUG USE_PUSH', 'DEBUG');
  replaced = replaced.replace('USE_PUSH', '""');
  if (replaced != txt) {
    writeFileSync(filename, replaced, 'utf-8');
  }
}

async function removeKey(filename: string, key: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let lines = txt.split('\n');
  let removed = false;
  let removing = false;
  lines = lines.filter(line => {
    if (removing && line.includes('</dict>')) {
      removing = false;
      return false;
    }
    if (line.includes(`<key>${key}</key`)) {
      removing = true;
      removed = true;
    }
    return !removing;
  });

  if (removed) {
    writeFileSync(filename, lines.join('\n'), 'utf-8');
  }
}

async function podfileAssertDeploymentTarget(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  if (
    !replaced.includes(
      `require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers`,
    )
  ) {
    replaced =
      `require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'\n\n` +
      txt;
  }
  if (replaced.includes('post_install do |installer|')) {
    if (!replaced.includes(`assertDeploymentTarget(installer)`)) {
      replaced = replaced.replace(
        'post_install do |installer|',
        `post_install do |installer|\n  assertDeploymentTarget(installer)\n`,
      );
    }
  } else {
    replaced =
      replaced +
      `\n\npost_install do |installer|\n  assertDeploymentTarget(installer)\nend\n`;
  }
  writeFileSync(filename, replaced, 'utf-8');
}

async function removeOldInitAndroid(config: Config) {
  const xmlData = await readXML(
    join(config.android.srcMainDirAbs, 'AndroidManifest.xml'),
  );
  const manifestNode: any = xmlData.manifest;
  const applicationChildNodes: any[] = manifestNode.application;
  let mainActivityClassPath = '';
  applicationChildNodes.find(applicationChildNode => {
    const activityChildNodes: any[] = applicationChildNode.activity;
    if (!Array.isArray(activityChildNodes)) {
      return false;
    }

    const mainActivityNode = activityChildNodes.find(activityChildNode => {
      const intentFilterChildNodes: any[] = activityChildNode['intent-filter'];
      if (!Array.isArray(intentFilterChildNodes)) {
        return false;
      }

      return intentFilterChildNodes.find(intentFilterChildNode => {
        const actionChildNodes: any[] = intentFilterChildNode.action;
        if (!Array.isArray(actionChildNodes)) {
          return false;
        }

        const mainActionChildNode = actionChildNodes.find(actionChildNode => {
          const androidName = actionChildNode.$['android:name'];
          return androidName === 'android.intent.action.MAIN';
        });

        if (!mainActionChildNode) {
          return false;
        }

        const categoryChildNodes: any[] = intentFilterChildNode.category;
        if (!Array.isArray(categoryChildNodes)) {
          return false;
        }

        return categoryChildNodes.find(categoryChildNode => {
          const androidName = categoryChildNode.$['android:name'];
          return androidName === 'android.intent.category.LAUNCHER';
        });
      });
    });

    if (mainActivityNode) {
      mainActivityClassPath = mainActivityNode.$['android:name'];
    }

    return mainActivityNode;
  });
  const mainActivityClassName: any = mainActivityClassPath.split('.').pop();
  const mainActivityPathArray = mainActivityClassPath.split('.');
  mainActivityPathArray.pop();
  const mainActivityClassFileName = `${mainActivityClassName}.java`;
  const mainActivityClassFilePath = join(
    join(config.android.srcMainDirAbs, 'java'),
    ...mainActivityPathArray,
    mainActivityClassFileName,
  );

  let data = readFile(mainActivityClassFilePath);

  if (data) {
    const bindex = data.indexOf('this.init(savedInstanceState');
    if (bindex == -1) return;
    const eindex = data.indexOf('}});', bindex) + 4;

    data = data.replace(data.substring(bindex, eindex), '');

    data = data.replace('// Initializes the Bridge', '');

    writeFileSync(mainActivityClassFilePath, data);
  }
}

async function addNewSplashScreen(config: Config) {
  const stylePath = join(
    config.android.srcMainDirAbs,
    'res',
    'values',
    'styles.xml',
  );
  let stylesXml = readFile(stylePath);

  if (!stylesXml) return;

  stylesXml = stylesXml.replace('AppTheme.NoActionBar', 'Theme.SplashScreen');
  writeFileSync(stylePath, stylesXml);
}
