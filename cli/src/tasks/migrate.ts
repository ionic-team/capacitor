// import c from '../colors';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
const coreVersion = '^4.0.0-beta.2';
const pluginVersion = '^4.0.0-beta.2';

export async function migrateCommand(config: Config): Promise<void> {
  configData = config;
  allDependencies = {
    ...(configData ? configData.app.package.dependencies : {}),
    ...(configData ? configData.app.package.devDependencies : {}),
  };

  const daysLeft = daysUntil(new Date('11/01/2022'));
  let warning = `Google Play Store requires a minimum target of SDK 31 by 1st November 2022`;
  if (daysLeft > 0) {
    warning += ` (${daysLeft} days left)`;
  }

  const { migrateconfirm } = await logPrompt(
    `Capacitor 4 sets a deployment target of iOS 13 and Android 12 (SDK 32). \n${warning}\n`,
    {
      type: 'text',
      name: 'migrateconfirm',
      message: `Are you sure you want to migrate? (Y/n)`,
      initial: 'y',
    },
  );

  if (migrateconfirm === 'y') {
    logger.info(`Migrating to Capacitor ${coreVersion}...`);
    try {
      if (configData === null) {
        fatal('Config data missing');
      }
      await installLatestNPMLibs();
      await migrateStoragePluginToPreferences();
  
      if (allDependencies['@capacitor/ios']) {
        // Set deployment target to 13.0
        updateFile(
          join('ios', 'App', 'App.xcodeproj', 'project.pbxproj'),
          'IPHONEOS_DEPLOYMENT_TARGET = ',
          ';',
          '13.0',
        );
        // Update Podfile to 13.0
        updateFile(
          join('ios', 'App', 'Podfile'),
          `platform :ios, '`,
          `'`,
          '13.0',
        );
        // Remove touchesBegan
        updateFile(
          join('ios', 'App', 'App', 'AppDelegate.swift'),
          `override func touchesBegan`,
          `}`,
        );
        // Remove NSAppTransportSecurity
        removeKey(
          join(configData.app.rootDir, 'ios', 'App', 'App', 'info.plist'),
          'NSAppTransportSecurity',
        );
        // Remove USE_PUSH
        replacePush(
          join(
            configData.app.rootDir,
            'ios',
            'App',
            'App.xcodeproj',
            'project.pbxproj',
          ),
        );
        // Remove from App Delegate
        removeInFile(
          join(configData.app.rootDir, 'ios', 'App', 'App', 'AppDelegate.swift'),
          `#if USE_PUSH`,
          `#endif`,
        );
      }
  
      if (allDependencies['@capacitor/android']) {
        // AndroidManifest.xml add attribute: <activity android:exported="true"
        updateAndroidManifest(
          join(
            configData.app.rootDir,
            'android',
            'app',
            'src',
            'main',
            'AndroidManifest.xml',
          ),
        );
        // Update build.gradle
        updateBuildGradle(
          join(configData.app.rootDir, 'android', 'build.gradle'),
        );
        updateAppBuildGradle(
          join(configData.app.rootDir, 'android', 'app', 'build.gradle'),
        );
        // Update gradle-wrapper.properties
        updateGradleWrapper(
          join(
            configData.app.rootDir,
            'android',
            'gradle',
            'wrapper',
            'gradle-wrapper.properties',
          ),
        );
        // Update .gitIgnore
        updateGitIgnore(join(configData.app.rootDir, 'android', '.gitignore'), [
          `# Generated Config files`,
          `app/src/main/assets/capacitor.config.json`,
          `app/src/main/assets/capacitor.plugins.json`,
          `app/src/main/res/xml/config.xml`,
        ]);
        // Update .gitIgnore
        updateGitIgnore(join(configData.app.rootDir, 'ios', '.gitignore'), [
          `# Generated Config files`,
          `App/App/capacitor.config.json`,
          `App/App/config.xml`,
        ]);
  
        // Variables gradle
        const variables: { [key: string]: any } = {
          minSdkVersion: 22,
          compileSdkVersion: 32,
          targetSdkVersion: 32,
          androidxActivityVersion: '1.4.0',
          androidxAppCompatVersion: '1.4.1',
          androidxCoordinatorLayoutVersion: '1.2.0',
          androidxCoreVersion: '1.7.0',
          androidxFragmentVersion: '1.4.1',
          junitVersion: '4.13.2',
          androidxJunitVersion: '1.1.3',
          androidxEspressoCoreVersion: '3.4.0',
          cordovaAndroidVersion: '10.1.1',
        };
        for (const variable of Object.keys(variables)) {
          if (
            !updateFile(
              join('android', 'variables.gradle'),
              `${variable} = '`,
              `'`,
              variables[variable].toString(),
              true,
            )
          ) {
            updateFile(
              join('android', 'variables.gradle'),
              `${variable} = `,
              `\n`,
              variables[variable].toString(),
              true,
            );
          }
        }
      }
  
      // Ran Cap Sync
      await getCommandOutput('npx', ['cap', 'sync']);
  
      writeBreakingChanges();
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

async function installLatestNPMLibs() {
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

  await getCommandOutput('npm', ['i', ...result]);
}

async function migrateStoragePluginToPreferences() {
  if (allDependencies['@capacitor/storage']) {
    await getCommandOutput('npm', ['uninstall', '@capacitor/storage']);
    await getCommandOutput('npm', [
      'i',
      `@capacitor/preferences@${pluginVersion}`,
    ]);
    logger.info('Migrated @capacitor/storage to @capacitor/preferences.');
  }
}

function writeBreakingChanges() {
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

function updateAndroidManifest(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }

  // AndroidManifest.xml add attribute: <activity android:exported="true"
  if (txt.includes('<activity android:exported="')) {
    return; // Probably already updated manually
  }
  const replaced = setAllStringIn(
    txt,
    '<activity',
    ' ',
    ' android:exported="true"',
  );
  if (txt == replaced) {
    logger.error(`Unable to update Android Manifest. Missing <activity> tag`);
    return;
  }
  writeFileSync(filename, replaced, 'utf-8');
  logger.info(
    `Migrated AndroidManifest.xml by adding android:exported attribute to Activity.`,
  );
}

function updateBuildGradle(filename: string) {
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
      logger.info(`Migrated build.gradle set ${dep} = ${neededDeps[dep]}.`);
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
        logger.info(`Migrated build.gradle added mavenCentral().`);
      }
      inRepositories = false;
    }
    if (inRepositories && line.trim() === 'mavenCentral()') {
      hasMavenCentral = true;
    }
    if (inRepositories && line.trim() === 'jcenter()') {
      // skip jCentral()
      logger.info(`Migrated build.gradle removed jcenter().`);
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

function updateAppBuildGradle(filename: string) {
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
  logger.info(
    `Migrated ${filename} by adding androidx.coordinatorlayout dependency.`,
  );
}

function updateGradleWrapper(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  if (replaced.includes('gradle-7.0-all.zip')) {
    replaced = setAllStringIn(
      replaced,
      'distributionUrl=',
      '\n',
      // eslint-disable-next-line no-useless-escape
      `https\://services.gradle.org/distributions/gradle-7.4.2-bin.zip`,
    );
    writeFileSync(filename, replaced, 'utf-8');
    logger.info(
      `Migrated gradle-wrapper.properties by updating gradle version from 7.0 to 7.4.2.`,
    );
  }
}

function updateGitIgnore(filename: string, lines: string[]) {
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
    logger.info(`Migrated .gitignore by adding generated config files.`);
  }
}

function updateFile(
  filename: string,
  textStart: string,
  textEnd: string,
  replacement?: string,
  skipIfNotFound?: boolean,
): boolean {
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
    const message = replacement ? `${textStart} => ${replacement}` : '';
    logger.info(`Migrated ${filename} ${message}.`);
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

function removeInFile(filename: string, startLine: string, endLine: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let changed = false;
  let lines = txt.split('\n');
  let removing = false;
  lines = lines.filter(line => {
    if (line.includes(endLine)) {
      removing = false;
      return false;
    }
    if (line.includes(startLine)) {
      removing = true;
      changed = true;
    }
    return !removing;
  });
  if (changed) {
    writeFileSync(filename, lines.join('\n'), 'utf-8');
    logger.info(`Migrated ${filename} by removing ${startLine}.`);
  }
}

function replacePush(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;
  replaced = replaced.replace('DEBUG USE_PUSH', 'DEBUG');
  replaced = replaced.replace('USE_PUSH', '""');
  if (replaced != txt) {
    writeFileSync(filename, replaced, 'utf-8');
    logger.info(`Migrated ${filename} by removing USE_PUSH.`);
  }
}

function removeKey(filename: string, key: string) {
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
    logger.info(`Migrated info.plist by removing  ${key} key.`);
  }
}
