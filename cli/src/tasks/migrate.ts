import { writeFileSync, readFileSync, existsSync } from '@ionic/utils-fs';
import { join } from 'path';
import rimraf from 'rimraf';

import { getAndroidPlugins } from '../android/common';
import c from '../colors';
import { getCoreVersion, runTask, checkJDKMajorVersion } from '../common';
import type { Config } from '../definitions';
import { fatal } from '../errors';
import { logger, logPrompt, logSuccess } from '../log';
import { getPlugins } from '../plugin';
import { deleteFolderRecursive } from '../util/fs';
import { resolveNode } from '../util/node';
import { runCommand, getCommandOutput } from '../util/subprocess';
import { extractTemplate } from '../util/template';

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
const gradleVersion = '8.2.1';
let installFailed = false;

export async function migrateCommand(
  config: Config,
  noprompt: boolean,
  packagemanager: string,
): Promise<void> {
  if (config === null) {
    fatal('Config data missing');
  }

  const capMajor = await checkCapacitorMajorVersion(config);
  if (capMajor < 5) {
    fatal(
      'Migrate can only be used on capacitor 5 and above, please use the CLI in Capacitor 5 to upgrade to 5 first',
    );
  }

  const jdkMajor = await checkJDKMajorVersion();

  if (jdkMajor < 17) {
    logger.warn('Capacitor 6 requires JDK 17 or higher. Some steps may fail.');
  }

  const variablesAndClasspaths:
    | {
        'variables': any;
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
    'Please note this tool is not intended for use in a mono-repo enviroment, please check out the Ionic vscode extension for this functionality.';

  logger.info(monorepoWarning);

  const { migrateconfirm } = noprompt
    ? { migrateconfirm: 'y' }
    : await logPrompt(
        `Capacitor 6 sets a deployment target of iOS 13 and Android 14 (SDK 34). \n`,
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
      const { depInstallConfirm } = noprompt
        ? { depInstallConfirm: 'y' }
        : await logPrompt(
            `Would you like the migrator to run npm, yarn, or pnpm install to install the latest versions of capacitor packages? (Those using other package managers should answer N)`,
            {
              type: 'text',
              name: 'depInstallConfirm',
              message: `Run Dependency Install? (Y/n)`,
              initial: 'y',
            },
          );

      const runNpmInstall =
        typeof depInstallConfirm === 'string' &&
        depInstallConfirm.toLowerCase() === 'y';

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
              ],
              initial: 0,
            });
        installerType = manager;
      }

      try {
        await runTask(
          `Installing Latest Modules using ${installerType}.`,
          () => {
            return installLatestLibs(installerType, runNpmInstall, config);
          },
        );
      } catch (ex) {
        logger.error(
          `${installerType} install failed. Try deleting node_modules folder and running ${c.input(
            `${installerType} install --force`,
          )} manually.`,
        );
        installFailed = true;
      }

      // Update iOS Projects
      if (
        allDependencies['@capacitor/ios'] &&
        existsSync(config.ios.platformDirAbs)
      ) {
        // ios template changes
      }

      if (
        allDependencies['@capacitor/android'] &&
        existsSync(config.android.platformDirAbs)
      ) {
        await runTask(`Migrating build.gradle file.`, () => {
          return updateBuildGradle(
            join(config.android.platformDirAbs, 'build.gradle'),
            variablesAndClasspaths,
          );
        });

        // Replace deprecated compileSdkVersion
        await runTask(
          'Replacing deprecated compileSdkVersion from build.gradle',
          () => {
            return (async (): Promise<void> => {
              const buildGradleFilename = join(
                config.android.platformDirAbs,
                'app',
                'build.gradle',
              );
              const buildGradleText = readFile(buildGradleFilename);

              if (!buildGradleText) {
                logger.error(
                  `Could not read ${buildGradleFilename}. Check its permissions and if it exists.`,
                );
                return;
              }
              const compileSdk = `compileSdkVersion rootProject.ext.compileSdkVersion`;
              if (buildGradleText.includes(compileSdk)) {
                const buildGradleReplaced = buildGradleText.replace(
                  compileSdk,
                  `compileSdk rootProject.ext.compileSdkVersion`,
                );

                writeFileSync(
                  buildGradleFilename,
                  buildGradleReplaced,
                  'utf-8',
                );
              }
            })();
          },
        );

        // Update gradle-wrapper.properties
        await runTask(
          `Migrating gradle-wrapper.properties by updating gradle version to ${gradleVersion}.`,
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
            const variablesPath = join(
              config.android.platformDirAbs,
              'variables.gradle',
            );
            let txt = readFile(variablesPath);
            if (!txt) {
              return;
            }
            txt = txt.replace(/= {2}'/g, `= '`);
            writeFileSync(variablesPath, txt, { encoding: 'utf-8' });
            for (const variable of Object.keys(
              variablesAndClasspaths.variables,
            )) {
              if (
                !(await updateFile(
                  config,
                  variablesPath,
                  `${variable} = '`,
                  `'`,
                  variablesAndClasspaths.variables[variable].toString(),
                  true,
                ))
              ) {
                const didWork = await updateFile(
                  config,
                  variablesPath,
                  `${variable} = `,
                  `\n`,
                  variablesAndClasspaths.variables[variable].toString(),
                  true,
                );
                if (!didWork) {
                  let file = readFile(variablesPath);
                  if (file) {
                    file = file.replace(
                      '}',
                      `    ${variable} = '${variablesAndClasspaths.variables[
                        variable
                      ].toString()}'\n}`,
                    );
                    writeFileSync(variablesPath, file);
                  }
                }
              }
            }
            const pluginVariables: { [key: string]: string } = {
              firebaseMessagingVersion: '23.3.1',
              playServicesLocationVersion: '21.0.1',
              androidxBrowserVersion: '1.7.0',
              androidxMaterialVersion: '1.10.0',
              androidxExifInterfaceVersion: '1.3.6',
              androidxCoreKTXVersion: '1.12.0',
              googleMapsPlayServicesVersion: '18.1.0',
              googleMapsUtilsVersion: '3.5.3',
              googleMapsKtxVersion: '3.4.0',
              googleMapsUtilsKtxVersion: '3.4.0',
              kotlinxCoroutinesVersion: '1.7.3',
              coreSplashScreenVersion: '1.0.1',
            };
            for (const variable of Object.keys(pluginVariables)) {
              await updateFile(
                config,
                variablesPath,
                `${variable} = '`,
                `'`,
                pluginVariables[variable],
                true,
              );
            }
          })();
        });

        rimraf.sync(join(config.android.appDirAbs, 'build'));

        if (!installFailed) {
          await runTask(
            'Migrating package from Manifest to build.gradle in Capacitor plugins',
            () => {
              return patchOldCapacitorPlugins(config);
            },
          );
        } else {
          logger.warn(
            'Skipped migrating package from Manifest to build.gradle in Capacitor plugins',
          );
        }
      }

      if (!installFailed) {
        // Run Cap Sync
        await runTask(`Running cap sync.`, () => {
          return getCommandOutput('npx', ['cap', 'sync']);
        });
      } else {
        logger.warn('Skipped Running cap sync.');
      }

      if (
        allDependencies['@capacitor/android'] &&
        existsSync(config.android.platformDirAbs)
      ) {
        if (!installFailed) {
          try {
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
      }

      // Write all breaking changes
      await runTask(`Writing breaking changes.`, () => {
        return writeBreakingChanges();
      });

      if (!installFailed) {
        logSuccess(
          `Migration to Capacitor ${coreVersion} is complete. Run and test your app!`,
        );
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
  const versionArray =
    capacitorVersion.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/) ?? [];
  const majorVersion = parseInt(versionArray[1]);
  return majorVersion;
}

async function installLatestLibs(
  dependencyManager: string,
  runInstall: boolean,
  config: Config,
) {
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
    logger.info(
      `Please run an install command with your package manager of choice. (ex: yarn install)`,
    );
  }
}

async function writeBreakingChanges() {
  const breaking = [
    '@capacitor/camera',
    '@capacitor/device',
    '@capacitor/local-notifications',
    '@capacitor/push-notifications',
  ];
  const broken = [];
  for (const lib of breaking) {
    if (allDependencies[lib]) {
      broken.push(lib);
    }
  }
  if (broken.length > 0) {
    logger.info(
      `IMPORTANT: Review https://capacitorjs.com/docs/updating/5-0#plugins for breaking changes in these plugins that you use: ${broken.join(
        ', ',
      )}.`,
    );
  }
}

async function getAndroidVariablesAndClasspaths(config: Config) {
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
    `https\\://services.gradle.org/distributions/gradle-${gradleVersion}-all.zip`,
  );
  writeFileSync(filename, replaced, 'utf-8');
}

async function updateGradleWrapperFiles(platformDir: string) {
  await runCommand(
    `./gradlew`,
    [
      'wrapper',
      '--distribution-type',
      'all',
      '--gradle-version',
      gradleVersion,
      '--warning-mode',
      'all',
    ],
    {
      cwd: platformDir,
    },
  );
}

async function movePackageFromManifestToBuildGradle(
  manifestFilename: string,
  buildGradleFilename: string,
) {
  const manifestText = readFile(manifestFilename);
  const buildGradleText = readFile(buildGradleFilename);

  if (!manifestText) {
    logger.error(
      `Could not read ${manifestFilename}. Check its permissions and if it exists.`,
    );
    return;
  }

  if (!buildGradleText) {
    logger.error(
      `Could not read ${buildGradleFilename}. Check its permissions and if it exists.`,
    );
    return;
  }

  const namespaceExists = new RegExp(/\s+namespace\s+/).test(buildGradleText);
  if (namespaceExists) {
    logger.error('Found namespace in build.gradle already, skipping migration');
    return;
  }

  let packageName: string;
  const manifestRegEx = new RegExp(/package="([^"]+)"/);
  const manifestResults = manifestRegEx.exec(manifestText);

  if (manifestResults === null) {
    logger.error(`Unable to update Android Manifest. Package not found.`);
    return;
  } else {
    packageName = manifestResults[1];
  }

  let manifestReplaced = manifestText;

  manifestReplaced = manifestReplaced.replace(manifestRegEx, '');

  if (manifestText == manifestReplaced) {
    logger.error(
      `Unable to update Android Manifest: no changes were detected in Android Manifest file`,
    );
    return;
  }

  let buildGradleReplaced = buildGradleText;

  buildGradleReplaced = setAllStringIn(
    buildGradleText,
    'android {',
    '\n',
    `\n    namespace "${packageName}"`,
  );

  if (buildGradleText == buildGradleReplaced) {
    logger.error(
      `Unable to update buildGradleText: no changes were detected in Android Manifest file`,
    );
    return;
  }

  writeFileSync(manifestFilename, manifestReplaced, 'utf-8');
  writeFileSync(buildGradleFilename, buildGradleReplaced, 'utf-8');
}

async function updateBuildGradle(
  filename: string,
  variablesAndClasspaths: {
    'variables': any;
    'com.android.tools.build:gradle': string;
    'com.google.gms:google-services': string;
  },
) {
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
    if (replaced.includes(`classpath '${dep}`)) {
      const semver = await import('semver');
      const firstIndex = replaced.indexOf(dep) + dep.length + 1;
      const existingVersion =
        '' + replaced.substring(firstIndex, replaced.indexOf("'", firstIndex));
      if (semver.gte(neededDeps[dep], existingVersion)) {
        replaced = setAllStringIn(
          replaced,
          `classpath '${dep}:`,
          `'`,
          neededDeps[dep],
        );
        logger.info(`Set ${dep} = ${neededDeps[dep]}.`);
      }
    }
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

export async function patchOldCapacitorPlugins(
  config: Config,
): Promise<void[]> {
  const allPlugins = await getPlugins(config, 'android');
  const androidPlugins = await getAndroidPlugins(allPlugins);
  return await Promise.all(
    androidPlugins.map(async p => {
      if (p.manifest?.android?.src) {
        const buildGradlePath = resolveNode(
          config.app.rootDir,
          p.id,
          p.manifest.android.src,
          'build.gradle',
        );
        const manifestPath = resolveNode(
          config.app.rootDir,
          p.id,
          p.manifest.android.src,
          'src',
          'main',
          'AndroidManifest.xml',
        );
        if (buildGradlePath && manifestPath) {
          const gradleContent = readFile(buildGradlePath);
          if (!gradleContent?.includes('namespace')) {
            if (plugins.includes(p.id)) {
              logger.warn(
                `You are using an outdated version of ${p.id}, update the plugin to version ${pluginVersion}`,
              );
            } else {
              logger.warn(
                `${p.id}@${p.version} doesn't officially support Capacitor ${coreVersion} yet, doing our best moving it's package to build.gradle so it builds`,
              );
            }
            movePackageFromManifestToBuildGradle(manifestPath, buildGradlePath);
          }
        }
      }
    }),
  );
}
