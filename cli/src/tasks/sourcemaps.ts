import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from '@ionic/utils-fs';
import { join, extname } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';

function findJSAssetsDir(buildDir: string): string {
  const reactJSDir = '/static/js';
  const vueJSDir = '/js';

  if (existsSync(buildDir + reactJSDir)) {
    return reactJSDir;
  }

  if (existsSync(buildDir + vueJSDir)) {
    return vueJSDir;
  }

  return '/';
}

export async function inlineSourceMaps(
  config: Config,
  platformName: string,
): Promise<void> {
  let buildDir = '';

  if (platformName == config.ios.name) {
    buildDir = await config.ios.webDirAbs;
  }

  if (platformName == config.android.name) {
    buildDir = await config.android.webDirAbs;
  }

  if (buildDir) {
    logger.info('Inlining sourcemaps');
    const jsAssetsDir = findJSAssetsDir(buildDir);
    buildDir += jsAssetsDir;

    const files = readdirSync(buildDir);
    files.forEach(file => {
      const mapFile = join(buildDir, `${file}.map`);
      if (extname(file) === '.js' && existsSync(mapFile)) {
        const targetFile = join(buildDir, file);
        const bufMap = readFileSync(mapFile).toString('base64');
        const bufFile = readFileSync(targetFile, 'utf8');
        const result = bufFile.replace(
          `sourceMappingURL=${file}.map`,
          'sourceMappingURL=data:application/json;charset=utf-8;base64,' +
            bufMap,
        );
        writeFileSync(targetFile, result);
        unlinkSync(mapFile);
      }
    });
  }
}
