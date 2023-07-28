import { pathExists, readdirp, readFile } from '@ionic/utils-fs';
import { join, extname, parse } from 'path';

import c from '../colors';
import { check } from '../common';
import type { Config } from '../definitions';
import { fatal, isFatal } from '../errors';
import { logSuccess } from '../log';
import { readXML } from '../util/xml';

export async function doctorAndroid(config: Config): Promise<void> {
  try {
    await check([
      checkAndroidInstalled,
      () => checkGradlew(config),
      () => checkAppSrcDirs(config),
    ]);
    logSuccess('Android looking great! 👌');
  } catch (e: any) {
    if (!isFatal(e)) {
      fatal(e.stack ?? e);
    }

    throw e;
  }
}

async function checkAppSrcDirs(config: Config): Promise<string | null> {
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

async function checkAndroidManifestFile(
  config: Config,
): Promise<string | null> {
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
  } catch (e: any) {
    return e;
  }
}

async function checkAndroidManifestData(
  config: Config,
  xmlData: any,
): Promise<string | null> {
  const manifestNode: any = xmlData.manifest;
  if (!manifestNode) {
    return `Missing ${c.input('<manifest>')} XML node in ${c.strong(
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

  return checkPackage(config, mainActivityClassPath);
}

async function checkPackage(config: Config, mainActivityClassPath: string) {
  const appSrcMainJavaDir = join(config.android.srcMainDirAbs, 'java');
  if (!(await pathExists(appSrcMainJavaDir))) {
    return `${c.strong('java')} directory is missing in ${c.strong(
      appSrcMainJavaDir,
    )}`;
  }

  const mainActivityClassName: any = mainActivityClassPath.split('.').pop();

  const srcFiles = await readdirp(appSrcMainJavaDir, {
    filter: entry =>
      !entry.stats.isDirectory() &&
      ['.java', '.kt'].includes(extname(entry.path)) &&
      mainActivityClassName === parse(entry.path).name,
  });

  if (srcFiles.length == 0) {
    return `Main activity file (${mainActivityClassName}) is missing`;
  }

  return checkBuildGradle(config);
}

async function checkBuildGradle(config: Config) {
  const fileName = 'build.gradle';
  const filePath = join(config.android.appDirAbs, fileName);

  if (!(await pathExists(filePath))) {
    return `${c.strong(fileName)} file is missing in ${c.strong(
      config.android.appDir,
    )}`;
  }

  let fileContent = await readFile(filePath, { encoding: 'utf-8' });

  fileContent = fileContent.replace(/'|"/g, '').replace(/\s+/g, ' ');

  const searchFor = `applicationId`;

  if (fileContent.indexOf(searchFor) === -1) {
    return `${c.strong('build.gradle')} file missing ${c.input(
      `applicationId`,
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
