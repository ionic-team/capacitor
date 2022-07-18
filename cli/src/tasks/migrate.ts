import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { runTask } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger, logPrompt, logSuccess } from '../log';
import { getCommandOutput } from '../util/subprocess';

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
let configData: Config | null = null;
const coreVersion = 'next';
const pluginVersion = 'next';

export async function migrateCommand(config: Config): Promise<void> {
  configData = config;
  allDependencies = {
    ...(configData ? configData.app.package.dependencies : {}),
    ...(configData ? configData.app.package.devDependencies : {}),
  };

  const daysLeft = daysUntil(new Date('11/01/2022'));
  let googlePlayWarning = `Google Play Store requires a minimum target of SDK 31 by the 1st November 2022`;
  if (daysLeft > 0) {
    googlePlayWarning += ` (${daysLeft} days left)`;
  }

  const monorepoWarning =
    'Please note this tool is not intended for use in a mono-repo enviroment, please check out the Ionic vscode extension for this functionality.';

  logger.info(monorepoWarning);

  const { migrateconfirm } = await logPrompt(
    `Capacitor 4 sets a deployment target of iOS 13 and Android 12 (SDK 32). \n${googlePlayWarning} \n`,
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
      if (configData === null) {
        fatal('Config data missing');
      }

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
        return installLatestNPMLibs(runNpmInstall);
      });

      await runTask(
        `Migrating @capacitor/storage to @capacitor/preferences.`,
        () => {
          return migrateStoragePluginToPreferences(runNpmInstall);
        },
      );

      if (
        allDependencies['@capacitor/ios'] &&
        existsSync(join(configData.app.rootDir, 'ios'))
      ) {
        // Set deployment target to 13.0
        await runTask(`Migrating deployment target to 13.0.`, () => {
          return updateFile(
            join('ios', 'App', 'App.xcodeproj', 'project.pbxproj'),
            'IPHONEOS_DEPLOYMENT_TARGET = ',
            ';',
            '13.0',
          );
        });

        // Update Podfile to 13.0
        await runTask(`Migrating Podfile to 13.0.`, () => {
          return updateFile(
            join('ios', 'App', 'Podfile'),
            `platform :ios, '`,
            `'`,
            '13.0',
          );
        });

        // Remove touchesBegan
        await runTask(
          `Migrating AppDelegate.swift by removing touchesBegan.`,
          () => {
            return updateFile(
              join('ios', 'App', 'App', 'AppDelegate.swift'),
              `override func touchesBegan`,
              `}`,
            );
          },
        );

        // Remove NSAppTransportSecurity
        await runTask(
          `Migrating info.plist by removing NSAppTransportSecurity key.`,
          () => {
            return removeKey(
              join(configData!.app.rootDir, 'ios', 'App', 'App', 'info.plist'),
              'NSAppTransportSecurity',
            );
          },
        );

        // Remove USE_PUSH
        await runTask(`Migrating by removing USE_PUSH.`, () => {
          return replacePush(
            join(
              configData!.app.rootDir,
              'ios',
              'App',
              'App.xcodeproj',
              'project.pbxproj',
            ),
          );
        });

        // Remove from App Delegate
        await runTask(`Migrating App Delegate.`, () => {
          return replaceIfUsePush();
        });
      }

      if (
        allDependencies['@capacitor/android'] &&
        existsSync(join(configData.app.rootDir, 'android'))
      ) {
        // AndroidManifest.xml add attribute: <activity android:exported="true"
        await runTask(
          `Migrating AndroidManifest.xml by adding android:exported attribute to Activity.`,
          () => {
            return updateAndroidManifest(
              join(
                configData!.app.rootDir,
                'android',
                'app',
                'src',
                'main',
                'AndroidManifest.xml',
              ),
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
            join(configData!.app.rootDir, 'android', 'build.gradle'),
            typeof leaveJCenterPrompt === 'string' &&
              leaveJCenterPrompt.toLowerCase() === 'y',
          );
        });

        // Update app.gradle
        await runTask(`Migrating app.gradle file.`, () => {
          return updateAppBuildGradle(
            join(configData!.app.rootDir, 'android', 'app', 'build.gradle'),
          );
        });

        // Update gradle-wrapper.properties
        await runTask(
          `Migrating gradle-wrapper.properties by updating gradle version from 7.0 to 7.4.2.`,
          () => {
            return updateGradleWrapper(
              join(
                configData!.app.rootDir,
                'android',
                'gradle',
                'wrapper',
                'gradle-wrapper.properties',
              ),
            );
          },
        );

        // Update .gitIgnore
        await runTask(
          `Migrating .gitignore files by adding generated config files.`,
          () => {
            return (async () => {
              await updateGitIgnore(
                join(configData!.app.rootDir, 'android', '.gitignore'),
                [
                  `# Generated Config files`,
                  `app/src/main/assets/capacitor.config.json`,
                  `app/src/main/assets/capacitor.plugins.json`,
                  `app/src/main/res/xml/config.xml`,
                ],
              );
              await updateGitIgnore(
                join(configData!.app.rootDir, 'ios', '.gitignore'),
                [
                  `# Generated Config files`,
                  `App/App/capacitor.config.json`,
                  `App/App/config.xml`,
                ],
              );
            })();
          },
        );

        // Variables gradle
        await runTask(`Migrating variables.gradle file.`, () => {
          return (async (): Promise<void> => {
            const variables: { [key: string]: any } = {
              minSdkVersion: 22,
              compileSdkVersion: 32,
              targetSdkVersion: 32,
              androidxActivityVersion: '1.4.0',
              androidxAppCompatVersion: '1.4.2',
              androidxCoordinatorLayoutVersion: '1.2.0',
              androidxCoreVersion: '1.8.0',
              androidxFragmentVersion: '1.4.1',
              junitVersion: '4.13.2',
              androidxJunitVersion: '1.1.3',
              androidxEspressoCoreVersion: '3.4.0',
              cordovaAndroidVersion: '10.1.1',
            };
            for (const variable of Object.keys(variables)) {
              if (
                !(await updateFile(
                  join('android', 'variables.gradle'),
                  `${variable} = '`,
                  `'`,
                  variables[variable].toString(),
                  true,
                ))
              ) {
                await updateFile(
                  join('android', 'variables.gradle'),
                  `${variable} = `,
                  `\n`,
                  variables[variable].toString(),
                  true,
                );
              }
            }
          })();
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
}

function daysUntil(date_1: Date) {
  const date_2 = new Date();
  const difference = date_1.getTime() - date_2.getTime();
  return Math.ceil(difference / (1000 * 3600 * 24));
}

async function installLatestNPMLibs(runInstall: boolean) {
  const result: string[] = [];
  for (const lib of libs) {
    if (allDependencies[lib]) {
      result.push(`${lib}@${coreVersion}`);
    }
  }

  for (const plugin of plugins) {
    if (allDependencies[plugin]) {
      result.push(`${plugin}@${pluginVersion}`);
    }
  }

  if (runInstall) {
    await getCommandOutput('npm', ['i', ...result]);
  } else {
    logger.info(
      `Please run an install command with your package manager of choice with the following:`,
    );
    logger.info(`<pkg manager install cmd> ${result.join(' ')}`);
  }
}

async function migrateStoragePluginToPreferences(runInstall: boolean) {
  if (allDependencies['@capacitor/storage']) {
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
      `IMPORTANT: Review https://next.capacitorjs.com/docs/updating/4-0#plugins for breaking changes in these plugins that you use: ${broken.join(
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
      ' android:exported="true"',
    );
  } else {
    replaced = txt.replace(
      'android:exported="false"',
      'android:exported="true"',
    );
  }
  if (txt == replaced) {
    logger.error(`Unable to update Android Manifest. Missing <activity> tag`);
    return;
  }
  writeFileSync(filename, replaced, 'utf-8');
}

async function updateBuildGradle(filename: string, leaveJCenter: boolean) {
  // In build.gradle add dependencies:
  // classpath 'com.android.tools.build:gradle:7.2.1'
  // classpath 'com.google.gms:google-services:4.3.10'
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  const neededDeps: { [key: string]: string } = {
    'com.android.tools.build:gradle': '7.2.1',
    'com.google.gms:google-services': '4.3.10',
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
  if (txt.includes('androidx.coordinatorlayout:coordinatorlayout:')) {
    return;
  }

  const replaced = txt.replace(
    'dependencies {',
    'dependencies {\n    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"',
  );
  // const lines = txt.split('\n');
  writeFileSync(filename, replaced, 'utf-8');
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

async function updateGitIgnore(filename: string, lines: string[]) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  for (const line of lines) {
    if (!replaced.includes(line)) {
      replaced += line + '\n';
    }
  }
  if (replaced !== txt) {
    writeFileSync(filename, replaced, 'utf-8');
  }
}

async function updateFile(
  filename: string,
  textStart: string,
  textEnd: string,
  replacement?: string,
  skipIfNotFound?: boolean,
): Promise<boolean> {
  if (configData === null) {
    return false;
  }
  const path = join(configData.app.rootDir, filename);
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

async function replaceIfUsePush() {
  const startLine = '#if USE_PUSH';
  const endLine = '#endif';
  const filename = join(
    configData!.app.rootDir,
    'ios',
    'App',
    'App',
    'AppDelegate.swift',
  );
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
