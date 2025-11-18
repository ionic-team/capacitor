import { writeFileSync, readFileSync, existsSync } from 'fs-extra';
import { join } from 'path';
import { rimraf } from 'rimraf';
import { coerce, gte, lt } from 'semver';

import c from '../colors.js';
import { getCoreVersion, runTask, checkJDKMajorVersion } from '../common.js';
import type { Config } from '../definitions.js';
import { fatal } from '../errors.js';
import { getMajoriOSVersion } from '../ios/common.js';
import { logger, logPrompt, logSuccess } from '../log.js';
import { deleteFolderRecursive } from '../util/fs.js';
import { checkPackageManager } from '../util/spm.js';
import { runCommand } from '../util/subprocess.js';
import { extractTemplate } from '../util/template.js';

// eslint-disable-next-line prefer-const
let allDependencies: { [key: string]: any } = {};
const libs = ['@capacitor/core', '@capacitor/cli', '@capacitor/ios', '@capacitor/android'];
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
  '@capacitor/haptics',
  '@capacitor/keyboard',
  '@capacitor/local-notifications',
  '@capacitor/motion',
  '@capacitor/network',
  '@capacitor/preferences',
  '@capacitor/push-notifications',
  '@capacitor/screen-reader',
  '@capacitor/screen-orientation',
  '@capacitor/share',
  '@capacitor/splash-screen',
  '@capacitor/status-bar',
  '@capacitor/text-zoom',
  '@capacitor/toast',
];
const coreVersion = 'next';
const pluginVersion = 'next';
const gradleVersion = '8.14.3';
const iOSVersion = '15';
const kotlinVersion = '2.2.20';
let installFailed = false;

export async function migrateCommand(config: Config, noprompt: boolean, packagemanager: string): Promise<void> {
  if (config === null) {
    fatal('Config data missing');
  }

  const capMajor = await checkCapacitorMajorVersion(config);
  if (capMajor < 7) {
    fatal('Migrate can only be used on Capacitor 7, please use the CLI in Capacitor 7 to upgrade to 7 first');
  }

  const jdkMajor = await checkJDKMajorVersion();

  if (jdkMajor < 21) {
    logger.warn('Capacitor 8 requires JDK 21 or higher. Some steps may fail.');
  }

  const variablesAndClasspaths:
    | {
        variables: any;
        'com.android.tools.build:gradle': string;
        'com.google.gms:google-services': string;
      }
    | undefined = await getAndroidVariablesAndClasspaths(config);

  if (!variablesAndClasspaths) {
    fatal('Variable and Classpath info could not be read.');
  }

  allDependencies = {
    ...config.app.package.dependencies,
    ...config.app.package.devDependencies,
  };

  const monorepoWarning =
    'Please note this tool is not intended for use in a mono-repo environment, you should migrate manually instead. Refer to https://capacitorjs.com/docs/next/updating/8-0';

  logger.info(monorepoWarning);

  const { migrateconfirm } = noprompt
    ? { migrateconfirm: 'y' }
    : await logPrompt(`Capacitor 8 sets a deployment target of iOS ${iOSVersion} and Android 16 (SDK 36). \n`, {
        type: 'text',
        name: 'migrateconfirm',
        message: `Are you sure you want to migrate? (Y/n)`,
        initial: 'y',
      });

  if (typeof migrateconfirm === 'string' && migrateconfirm.toLowerCase() === 'y') {
    try {
      const { depInstallConfirm } = noprompt
        ? { depInstallConfirm: 'y' }
        : await logPrompt(
            `Would you like the migrator to run npm, yarn, pnpm, or bun install to install the latest versions of capacitor packages? (Those using other package managers should answer N)`,
            {
              type: 'text',
              name: 'depInstallConfirm',
              message: `Run Dependency Install? (Y/n)`,
              initial: 'y',
            },
          );

      const runNpmInstall = typeof depInstallConfirm === 'string' && depInstallConfirm.toLowerCase() === 'y';

      let installerType = 'npm';
      if (runNpmInstall) {
        const { manager } = packagemanager
          ? { manager: packagemanager }
          : await logPrompt('What dependency manager do you use?', {
              type: 'select',
              name: 'manager',
              message: `Dependency Management Tool`,
              choices: [
                { title: 'NPM', value: 'npm' },
                { title: 'Yarn', value: 'yarn' },
                { title: 'PNPM', value: 'pnpm' },
                { title: 'Bun', value: 'bun' },
              ],
              initial: 0,
            });
        installerType = manager;
      }

      try {
        await runTask(`Installing Latest Modules using ${installerType}.`, () => {
          return installLatestLibs(installerType, runNpmInstall, config);
        });
      } catch (ex) {
        logger.error(
          `${installerType} install failed. Try deleting node_modules folder and running ${c.input(
            `${installerType} install --force`,
          )} manually.`,
        );
        installFailed = true;
      }

      // Update iOS Projects
      if (allDependencies['@capacitor/ios'] && existsSync(config.ios.platformDirAbs)) {
        const currentiOSVersion = getMajoriOSVersion(config);
        if (parseInt(currentiOSVersion) < parseInt(iOSVersion)) {
          // ios template changes
          await runTask(`Migrating deployment target to ${iOSVersion}.0.`, () => {
            return updateFile(
              config,
              join(config.ios.nativeXcodeProjDirAbs, 'project.pbxproj'),
              'IPHONEOS_DEPLOYMENT_TARGET = ',
              ';',
              `${iOSVersion}.0`,
            );
          });

          if ((await checkPackageManager(config)) === 'Cocoapods') {
            // Update Podfile
            await runTask(`Migrating Podfile to ${iOSVersion}.0.`, () => {
              return updateFile(
                config,
                join(config.ios.nativeProjectDirAbs, 'Podfile'),
                `platform :ios, '`,
                `'`,
                `${iOSVersion}.0`,
              );
            });
          }
        } else {
          logger.warn('Skipped updating deployment target');
        }
      }

      if (!installFailed) {
        await runTask(`Running cap sync.`, () => {
          return runCommand('npx', ['cap', 'sync']);
        });
      } else {
        logger.warn('Skipped Running cap sync.');
      }

      if (allDependencies['@capacitor/android'] && existsSync(config.android.platformDirAbs)) {
        // AndroidManifest.xml add "density"
        await runTask(`Migrating AndroidManifest.xml by adding density to Activity configChanges.`, () => {
          return updateAndroidManifest(join(config.android.srcMainDirAbs, 'AndroidManifest.xml'));
        });

        const gradleWrapperVersion = getGradleWrapperVersion(
          join(config.android.platformDirAbs, 'gradle', 'wrapper', 'gradle-wrapper.properties'),
        );

        if (!installFailed && gte(gradleVersion, gradleWrapperVersion)) {
          try {
            await runTask(`Upgrading gradle wrapper`, () => {
              return updateGradleWrapperFiles(config.android.platformDirAbs);
            });
            // Run twice as first time it only updates the wrapper properties file
            await runTask(`Upgrading gradle wrapper files`, () => {
              return updateGradleWrapperFiles(config.android.platformDirAbs);
            });
          } catch (e: any) {
            if (e.includes('EACCES')) {
              logger.error(
                `gradlew file does not have executable permissions. This can happen if the Android platform was added on a Windows machine. Please run ${c.input(
                  `chmod +x ./${config.android.platformDir}/gradlew`,
                )} and ${c.input(
                  `cd ${config.android.platformDir} && ./gradlew wrapper --distribution-type all --gradle-version ${gradleVersion} --warning-mode all`,
                )} to update the files manually`,
              );
            } else {
              logger.error(`gradle wrapper files were not updated`);
            }
          }
        } else {
          logger.warn('Skipped upgrading gradle wrapper files');
        }
        await runTask(`Migrating root build.gradle file.`, () => {
          return updateBuildGradle(join(config.android.platformDirAbs, 'build.gradle'), variablesAndClasspaths);
        });

        await runTask(`Migrating app build.gradle file.`, () => {
          return updateAppBuildGradle(join(config.android.appDirAbs, 'build.gradle'));
        });

        // Variables gradle
        await runTask(`Migrating variables.gradle file.`, () => {
          return (async (): Promise<void> => {
            const variablesPath = join(config.android.platformDirAbs, 'variables.gradle');
            let txt = readFile(variablesPath);
            if (!txt) {
              return;
            }
            txt = txt.replace(/= {2}'/g, `= '`);
            writeFileSync(variablesPath, txt, { encoding: 'utf-8' });
            for (const variable of Object.keys(variablesAndClasspaths.variables)) {
              let replaceStart = `${variable} = '`;
              let replaceEnd = `'\n`;
              if (typeof variablesAndClasspaths.variables[variable] === 'number') {
                replaceStart = `${variable} = `;
                replaceEnd = `\n`;
              }

              if (txt.includes(replaceStart)) {
                const first = txt.indexOf(replaceStart) + replaceStart.length;
                const value = txt.substring(first, txt.indexOf(replaceEnd, first));
                if (
                  (typeof variablesAndClasspaths.variables[variable] === 'number' &&
                    value <= variablesAndClasspaths.variables[variable]) ||
                  (typeof variablesAndClasspaths.variables[variable] === 'string' &&
                    lt(value, variablesAndClasspaths.variables[variable]))
                ) {
                  await updateFile(
                    config,
                    variablesPath,
                    replaceStart,
                    replaceEnd,
                    variablesAndClasspaths.variables[variable].toString(),
                    true,
                  );
                }
              } else {
                let file = readFile(variablesPath);
                if (file) {
                  file = file.replace(
                    '}',
                    `    ${replaceStart}${variablesAndClasspaths.variables[variable].toString()}${replaceEnd}}`,
                  );
                  writeFileSync(variablesPath, file);
                }
              }
            }
            const pluginVariables: { [key: string]: string } = {
              firebaseMessagingVersion: '25.0.1',
              playServicesLocationVersion: '21.3.0',
              androidxBrowserVersion: '1.9.0',
              androidxMaterialVersion: '1.13.0',
              androidxExifInterfaceVersion: '1.4.1',
              androidxCoreKTXVersion: '1.17.0',
              googleMapsPlayServicesVersion: '19.2.0',
              googleMapsUtilsVersion: '3.19.1',
              googleMapsKtxVersion: '5.2.1',
              googleMapsUtilsKtxVersion: '5.2.1',
              kotlinxCoroutinesVersion: '1.10.2',
              coreSplashScreenVersion: '1.2.0',
            };
            for (const variable of Object.keys(pluginVariables)) {
              await updateFile(config, variablesPath, `${variable} = '`, `'`, pluginVariables[variable], true);
            }
          })();
        });

        rimraf.sync(join(config.android.appDirAbs, 'build'));
      }

      // Write all breaking changes
      await runTask(`Writing breaking changes.`, () => {
        return writeBreakingChanges();
      });

      if (!installFailed) {
        logSuccess(`Migration to Capacitor ${coreVersion} is complete. Run and test your app!`);
      } else {
        logger.warn(
          `Migration to Capacitor ${coreVersion} is incomplete. Check the log messages for more information.`,
        );
      }
    } catch (err) {
      fatal(`Failed to migrate: ${err}`);
    }
  } else {
    fatal(`User canceled migration.`);
  }
}

async function checkCapacitorMajorVersion(config: Config): Promise<number> {
  const capacitorVersion = await getCoreVersion(config);
  const versionArray = capacitorVersion.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/) ?? [];
  const majorVersion = parseInt(versionArray[1]);
  return majorVersion;
}

async function installLatestLibs(dependencyManager: string, runInstall: boolean, config: Config) {
  const pkgJsonPath = join(config.app.rootDir, 'package.json');
  const pkgJsonFile = readFile(pkgJsonPath);
  if (!pkgJsonFile) {
    return;
  }
  const pkgJson: any = JSON.parse(pkgJsonFile);

  for (const devDepKey of Object.keys(pkgJson['devDependencies'] || {})) {
    if (libs.includes(devDepKey)) {
      pkgJson['devDependencies'][devDepKey] = coreVersion;
    } else if (plugins.includes(devDepKey)) {
      pkgJson['devDependencies'][devDepKey] = pluginVersion;
    }
  }
  for (const depKey of Object.keys(pkgJson['dependencies'] || {})) {
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
    rimraf.sync(join(config.app.rootDir, 'node_modules/@capacitor/!(cli)'));
    await runCommand(dependencyManager, ['install']);
    if (dependencyManager == 'yarn') {
      await runCommand(dependencyManager, ['upgrade']);
    } else {
      await runCommand(dependencyManager, ['update']);
    }
  } else {
    logger.info(`Please run an install command with your package manager of choice. (ex: yarn install)`);
  }
}

async function writeBreakingChanges() {
  const breaking = [
    '@capacitor/action-sheet',
    '@capacitor/barcode-scanner',
    '@capacitor/browser',
    '@capacitor/camera',
    '@capacitor/google-maps',
    '@capacitor/push-notifications',
    '@capacitor/screen-orientation',
    '@capacitor/splash-screen',
    '@capacitor/status-bar',
  ];
  const broken = [];
  for (const lib of breaking) {
    if (allDependencies[lib]) {
      broken.push(lib);
    }
  }
  if (broken.length > 0) {
    logger.info(
      `IMPORTANT: Review https://capacitorjs.com/docs/next/updating/8-0#plugins for breaking changes in these plugins that you use: ${broken.join(
        ', ',
      )}.`,
    );
  }
}

async function getAndroidVariablesAndClasspaths(config: Config) {
  const tempAndroidTemplateFolder = join(config.cli.assetsDirAbs, 'tempAndroidTemplate');
  await extractTemplate(config.cli.assets.android.platformTemplateArchiveAbs, tempAndroidTemplateFolder);
  const variablesGradleFile = readFile(join(tempAndroidTemplateFolder, 'variables.gradle'));
  const buildGradleFile = readFile(join(tempAndroidTemplateFolder, 'build.gradle'));
  if (!variablesGradleFile || !buildGradleFile) {
    return;
  }
  deleteFolderRecursive(tempAndroidTemplateFolder);

  const firstIndxOfCATBGV = buildGradleFile.indexOf(`classpath 'com.android.tools.build:gradle:`) + 42;
  const firstIndxOfCGGGS = buildGradleFile.indexOf(`com.google.gms:google-services:`) + 31;
  const comAndroidToolsBuildGradleVersion =
    '' + buildGradleFile.substring(firstIndxOfCATBGV, buildGradleFile.indexOf("'", firstIndxOfCATBGV));
  const comGoogleGmsGoogleServices =
    '' + buildGradleFile.substring(firstIndxOfCGGGS, buildGradleFile.indexOf("'", firstIndxOfCGGGS));

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
    variables: variablesGradleAsJSON,
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
    logger.error(`Unable to read ${filename}. Verify it is not already open. ${err}`);
  }
}

function getGradleWrapperVersion(filename: string): string {
  const txt = readFile(filename);
  if (!txt) {
    return '0.0.0';
  }
  const version = txt.substring(txt.indexOf('gradle-') + 7, txt.indexOf('-all.zip'));
  const semverVersion = coerce(version)?.version;
  return semverVersion ? semverVersion : '0.0.0';
}

async function updateGradleWrapperFiles(platformDir: string) {
  await runCommand(
    `./gradlew`,
    ['wrapper', '--distribution-type', 'all', '--gradle-version', gradleVersion, '--warning-mode', 'all'],
    {
      cwd: platformDir,
    },
  );
}

async function updateBuildGradle(
  filename: string,
  variablesAndClasspaths: {
    variables: any;
    'com.android.tools.build:gradle': string;
    'com.google.gms:google-services': string;
  },
) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  const neededDeps: { [key: string]: string } = {
    'com.android.tools.build:gradle': variablesAndClasspaths['com.android.tools.build:gradle'],
    'com.google.gms:google-services': variablesAndClasspaths['com.google.gms:google-services'],
  };
  let replaced = txt;

  for (const dep of Object.keys(neededDeps)) {
    if (replaced.includes(`classpath '${dep}`)) {
      const firstIndex = replaced.indexOf(dep) + dep.length + 1;
      const existingVersion = '' + replaced.substring(firstIndex, replaced.indexOf("'", firstIndex));
      if (gte(neededDeps[dep], existingVersion)) {
        replaced = setAllStringIn(replaced, `classpath '${dep}:`, `'`, neededDeps[dep]);
        logger.info(`Set ${dep} = ${neededDeps[dep]}.`);
      }
    }
  }

  const beforeKotlinVersionUpdate = replaced;
  replaced = replaceVersion(replaced, /(ext\.kotlin_version\s*=\s*['"])([^'"]+)(['"])/, kotlinVersion);
  replaced = replaceVersion(replaced, /(org\.jetbrains\.kotlin:kotlin[^:]*:)([\d.]+)(['"])/, kotlinVersion);
  if (beforeKotlinVersionUpdate !== replaced) {
    logger.info(`Set Kotlin version to ${kotlinVersion}`);
  }
  writeFileSync(filename, replaced, 'utf-8');
}

function replaceVersion(text: string, regex: RegExp, newVersion: string): string {
  return text.replace(regex, (match, prefix, currentVersion, suffix) => {
    const semVer = coerce(currentVersion)?.version;
    if (gte(newVersion, semVer ? semVer : '0.0.0')) {
      return `${prefix || ''}${newVersion}${suffix || ''}`;
    }
    return match;
  });
}

async function updateAppBuildGradle(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }
  let replaced = txt;

  const gradlePproperties = ['compileSdk', 'namespace', 'ignoreAssetsPattern'];
  for (const prop of gradlePproperties) {
    // Use updated Groovy DSL syntax with " = " assignment
    const regex = new RegExp(`(^\\s*${prop})\\s+(?!=)(.+)$`, 'gm');
    replaced = replaced.replace(regex, (_match, key, value) => {
      return `${key} = ${value.trim()}`;
    });
  }
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
    logger.error(`Unable to find "${textStart}" in ${filename}. Try updating it manually`);
  }

  return false;
}

function setAllStringIn(data: string, start: string, end: string, replacement: string): string {
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
      result = result.substring(0, idx) + replacement + result.substring(result.indexOf(end, idx));
    }
  }
  return result;
}

async function updateAndroidManifest(filename: string) {
  const txt = readFile(filename);
  if (!txt) {
    return;
  }

  if (txt.includes('|density') || txt.includes('density|')) {
    return; // Probably already updated
  }
  // Since navigation was an optional change in Capacitor 7, attempting to add density and/or navigation
  const replaced = txt
    .replace(
      'android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"',
      'android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"',
    )
    .replace(
      'android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"',
      'android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"',
    );

  if (!replaced.includes('|density')) {
    logger.error(`Unable to add 'density' to 'android:configChanges' in ${filename}. Try adding it manually`);
  } else {
    writeFileSync(filename, replaced, 'utf-8');
  }
}
