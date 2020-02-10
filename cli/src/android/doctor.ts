import { accessSync } from 'fs';
import { check, logFatal, logSuccess, readXML } from '../common';
import { existsAsync, readFileAsync } from '../util/fs';
import { Config } from '../config';
import { join } from 'path';


export async function doctorAndroid(config: Config) {
  try {
    await check(
      config,
      [
        checkAndroidInstalled,
        checkGradlew,
        checkAppSrcDirs
      ]
    );
    logSuccess('Android looking great! 👌');
  } catch (e) {
    logFatal(e);
  }
  return Promise.resolve();
}

async function checkAppSrcDirs(config: Config) {
  const appDir = join(config.android.platformDir, 'app');
  if (!await existsAsync(appDir)) {
    return `"app" directory is missing in: ${config.android.platformDir}`;
  }

  const appSrcDir = join(appDir, 'src');
  if (!await existsAsync(appSrcDir)) {
    return `"src" directory is missing in: ${appDir}`;
  }

  const appSrcMainDir = join(appSrcDir, 'main');
  if (!await existsAsync(appSrcMainDir)) {
    return `"main" directory is missing in: ${appSrcDir}`;
  }

  const appSrcMainAssetsDir = join(appSrcMainDir, 'assets');
  if (!await existsAsync(appSrcMainAssetsDir)) {
    return `"assets" directory is missing in: ${appSrcMainDir}`;
  }

  const appSrcMainAssetsWwwDir = join(appSrcMainAssetsDir, 'public');
  if (!await existsAsync(appSrcMainAssetsWwwDir)) {
    return `"public" directory is missing in: ${appSrcMainAssetsDir}`;
  }

  const appSrcMainAssetsWwwIndexHtmlDir = join(appSrcMainAssetsWwwDir, 'index.html');
  if (!await existsAsync(appSrcMainAssetsWwwIndexHtmlDir)) {
    return `"index.html" directory is missing in: ${appSrcMainAssetsWwwDir}`;
  }

  return checkAndroidManifestFile(config, appSrcMainDir);
}

async function checkAndroidManifestFile(config: Config, appSrcMainDir: string) {
  const manifestFileName = 'AndroidManifest.xml';
  const manifestFilePath = join(appSrcMainDir, manifestFileName);

  if (!await existsAsync(manifestFilePath)) {
    return `"${manifestFileName}" is missing in: ${appSrcMainDir}`;
  }

  try {
    const xmlData = await readXML(manifestFilePath);
    return checkAndroidManifestData(config, appSrcMainDir, xmlData);
  } catch (e) {
    return e;
  }
}

async function checkAndroidManifestData(config: Config, appSrcMainDir: string, xmlData: any) {
  const manifestNode: any = xmlData.manifest;
  if (!manifestNode) {
    return `Missing <manifest> xml node in: ${appSrcMainDir}`;
  }

  const packageId = manifestNode.$['package'];
  if (!packageId) {
    return `Missing <manifest package=""> attribute in: ${appSrcMainDir}`;
  }

  const applicationChildNodes: any[] = manifestNode.application;
  if (!Array.isArray(manifestNode.application)) {
    return `Missing <application> xml node as a child node to <manifest> in: ${appSrcMainDir}`;
  }

  let mainActivityClassPath = '';

  const mainApplicationNode = applicationChildNodes.find(applicationChildNode => {
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

  if (!mainApplicationNode) {
    return `Missing main <activity> xml node in: ${appSrcMainDir}`;
  }

  if (!mainActivityClassPath) {
    return `Missing main <activity android:name=""> attribute for MainActivity class in: ${appSrcMainDir}`;
  }

  return checkPackage(config, appSrcMainDir, packageId, mainActivityClassPath);
}

async function checkPackage(config: Config, appSrcMainDir: string, packageId: string, mainActivityClassPath: string) {
  if (mainActivityClassPath.indexOf(packageId) !== 0) {
    return `Main Acitivity "${mainActivityClassPath}" is not in manifest package "${packageId}". Please update the packages to be the same.`;
  }

  const appSrcMainJavaDir = join(appSrcMainDir, 'java');
  if (!await existsAsync(appSrcMainJavaDir)) {
    return `"java" directory is missing in: ${appSrcMainDir}`;
  }

  let checkPath = appSrcMainJavaDir;
  const packageParts = packageId.split('.');

  for (var i = 0; i < packageParts.length; i++) {
    try {
      accessSync(join(checkPath, packageParts[i]));
      checkPath = join(checkPath, packageParts[i]);
    } catch (e) {
      return `"${packageParts[i]}" is missing in "${checkPath}". Please create a directory structure matching the package id "${packageId}" within the directory "${appSrcMainJavaDir}".`;
    }
  }

  const mainActivityClassName: any = mainActivityClassPath.split('.').pop();
  const mainActivityClassFileName = `${mainActivityClassName}.java`;
  const mainActivityClassFilePath = join(checkPath, mainActivityClassFileName);

  if (!await existsAsync(mainActivityClassFilePath)) {
    return `Main acitivity file "${mainActivityClassFileName}" is missing in: ${checkPath}`;
  }

  return checkBuildGradle(config, packageId);
}

async function checkBuildGradle(config: Config, packageId: string) {
  const appDir = join(config.android.platformDir, 'app');
  const fileName = 'build.gradle';
  const filePath = join(appDir, fileName);

  if (!await existsAsync(filePath)) {
    return `${fileName} file is missing in: ${appDir}`;
  }

  let fileContent = await readFileAsync(filePath, 'utf8');

  fileContent = fileContent.replace(/'|"/g, '').replace(/\s+/g, ' ');

  const searchFor = `applicationId ${packageId}`;

  if (fileContent.indexOf(searchFor) === -1) {
    return `build.gradle file missing 'applicationId "${packageId}"' config in: ${filePath}`;
  }

  return null;
}

async function checkGradlew(config: Config) {
  const fileName = 'gradlew';
  const filePath = join(config.android.platformDir, fileName);

  if (!await existsAsync(filePath)) {
    return `"${fileName}" file is missing in: ${config.android.platformDir}`;
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
