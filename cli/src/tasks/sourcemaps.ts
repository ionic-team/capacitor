import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  lstatSync,
} from '@ionic/utils-fs';
import { join, extname } from 'path';

import type { Config } from '../definitions';
import { logger } from '../log';

function walkDirectory(dirPath: string) {
  const files = readdirSync(dirPath);
  files.forEach(file => {
    const targetFile = join(dirPath, file);
    if (existsSync(targetFile) && lstatSync(targetFile).isDirectory()) {
      walkDirectory(targetFile);
    } else {
      const mapFile = join(dirPath, `${file}.map`);
      if (extname(file) === '.js' && existsSync(mapFile)) {
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
    }
  });
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
    walkDirectory(buildDir);
  }
}
