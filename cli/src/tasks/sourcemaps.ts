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

export async function inlineSourceMaps(
  config: Config,
  platformName: string,
): Promise<void> {
  let buildDir = '';

  if (platformName == config.ios.name) {
    logger.info(
      `inlining sourcemaps for ${platformName} - ${await config.ios.webDirAbs}`,
    );
    buildDir = await config.ios.webDirAbs;
  }

  if (platformName == config.android.name) {
    logger.info(
      `inlining sourcemaps for ${platformName} - ${await config.android.webDirAbs}`,
    );
    buildDir = await config.android.webDirAbs;
  }

  if (buildDir) {
    buildDir += "/static/js"
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
