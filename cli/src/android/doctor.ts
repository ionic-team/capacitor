import { pathExists, readFile } from '@ionic/utils-fs';
import { accessSync } from 'fs';
import { dirname, join } from 'path';

import c from '../colors';
import { check } from '../common';
import type { Config } from '../definitions';
import { logFatal, logSuccess } from '../log';
import { readXML } from '../util/xml';

export async function doctorAndroid(config: Config): Promise<void> {
  try {
    await check([
      checkAndroidInstalled,
      () => checkGradlew(config),
      () => checkAppSrcDirs(config),
    ]);
    logSuccess('Android looking great! 👌');
  } catch (e) {
    logFatal(e.stack ?? e);
  }
}

async function checkAppSrcDirs(config: Config) {
  if (!(await pathExists(config.android.appDirAbs))) {
    return `${c.strong(
      config.android.appDir,
    )} directory is missing in ${c.strong(config.android.platformDir)}`;
  }

  if (!(await pathExists(config.android.srcMainDirAbs))) {
    return `${c.strong(
      config.android.srcMainDir,
    )} directory is missing in ${c.strong(config.android.platformDir)}`;
  }

  if (!(await pathExists(config.android.assetsDirAbs))) {
    return `${c.strong(
      config.android.assetsDir,
    )} directory is missing in ${c.strong(config.android.platformDir)}`;
  }

  if (!(await pathExists(config.android.webDirAbs))) {
    return `${c.strong(
      config.android.webDir,
    )} directory is missing in ${c.strong(config.android.platformDir)}`;
  }

  const appSrcMainAssetsWwwIndexHtmlDir = join(
    config.android.webDirAbs,
    'index.html',
  );
  if (!(await pathExists(appSrcMainAssetsWwwIndexHtmlDir))) {
    return `${c.strong('index.html')} file is missing in ${c.strong(
      config.android.webDirAbs,
    )}`;
  }

  return checkAndroidManifestFile(config);
}

async function checkAndroidManifestFile(config: Config) {
  const manifestFileName = 'AndroidManifest.xml';
  const manifestFilePath = join(config.android.srcMainDirAbs, manifestFileName);

  if (!(await pathExists(manifestFilePath))) {
    return `${c.strong(manifestFileName)} is missing in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  try {
    const xmlData = await readXML(manifestFilePath);
    return checkAndroidManifestData(config, xmlData);
  } catch (e) {
    return e;
  }
}

async function checkAndroidManifestData(config: Config, xmlData: any) {
  const manifestNode: any = xmlData.manifest;
  if (!manifestNode) {
    return `Missing ${c.input('<manifest>')} XML node in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  const packageId = manifestNode.$['package'];
  if (!packageId) {
    return `Missing ${c.input('<manifest package="">')} attribute in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  const applicationChildNodes: any[] = manifestNode.application;
  if (!Array.isArray(manifestNode.application)) {
    return `Missing ${c.input(
      '<application>',
    )} XML node as a child node of ${c.input('<manifest>')} in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  let mainActivityClassPath = '';

  const mainApplicationNode = applicationChildNodes.find(
    applicationChildNode => {
      const activityChildNodes: any[] = applicationChildNode.activity;
      if (!Array.isArray(activityChildNodes)) {
        return false;
      }

      const mainActivityNode = activityChildNodes.find(activityChildNode => {
        const intentFilterChildNodes: any[] =
          activityChildNode['intent-filter'];
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
    },
  );

  if (!mainApplicationNode) {
    return `Missing main ${c.input('<activity>')} XML node in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  if (!mainActivityClassPath) {
    return `Missing ${c.input(
      '<activity android:name="">',
    )} attribute for MainActivity class in ${c.strong(
      config.android.srcMainDir,
    )}`;
  }

  return checkPackage(config, packageId, mainActivityClassPath);
}

async function checkPackage(
  config: Config,
  packageId: string,
  mainActivityClassPath: string,
) {
  if (mainActivityClassPath.indexOf(packageId) !== 0) {
    return (
      `MainActivity ${mainActivityClassPath} is not in manifest package ${c.input(
        packageId,
      )}.\n` + `Please update the packages to be the same.`
    );
  }

  const appSrcMainJavaDir = join(config.android.srcMainDirAbs, 'java');
  if (!(await pathExists(appSrcMainJavaDir))) {
    return `${c.strong('java')} directory is missing in ${c.strong(
      appSrcMainJavaDir,
    )}`;
  }

  let checkPath = appSrcMainJavaDir;
  const packageParts = packageId.split('.');

  for (const packagePart of packageParts) {
    try {
      accessSync(join(checkPath, packagePart));
      checkPath = join(checkPath, packagePart);
    } catch (e) {
      return (
        `${c.strong(packagePart)} is missing in ${checkPath}.\n` +
        `Please create a directory structure matching the Package ID ${c.input(
          packageId,
        )} within the ${appSrcMainJavaDir} directory.`
      );
    }
  }

  const mainActivityClassName: any = mainActivityClassPath.split('.').pop();
  const mainActivityClassFileName = `${mainActivityClassName}.java`;
  const mainActivityClassFilePath = join(checkPath, mainActivityClassFileName);

  if (!(await pathExists(mainActivityClassFilePath))) {
    return `Main activity file (${mainActivityClassFileName}) is missing in ${checkPath}`;
  }

  return checkBuildGradle(config, packageId);
}

async function checkBuildGradle(config: Config, packageId: string) {
  const fileName = 'build.gradle';
  const filePath = join(config.android.appDirAbs, fileName);

  if (!(await pathExists(filePath))) {
    return `${c.strong(fileName)} file is missing in ${c.strong(
      config.android.appDir,
    )}`;
  }

  let fileContent = await readFile(filePath, { encoding: 'utf-8' });

  fileContent = fileContent.replace(/'|"/g, '').replace(/\s+/g, ' ');

  const searchFor = `applicationId ${packageId}`;

  if (fileContent.indexOf(searchFor) === -1) {
    return `${c.strong('build.gradle')} file missing ${c.input(
      `applicationId "${packageId}"`,
    )} config in ${filePath}`;
  }

  return null;
}

async function checkGradlew(config: Config) {
  const fileName = 'gradlew';
  const filePath = join(config.android.platformDirAbs, fileName);

  if (!(await pathExists(filePath))) {
    return `${c.strong(fileName)} file is missing in ${c.strong(
      config.android.platformDir,
    )}`;
  }
  return null;
}

async function checkAndroidInstalled() {
  /*
  if (!await isInstalled('android')) {
    return 'Android is not installed. For information: https://developer.android.com/studio/index.html';
  }
  */
  return null;
}
