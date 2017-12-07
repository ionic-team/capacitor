import { Config } from '../config';
import { copy } from 'fs-extra';
import { emptyDirAsync, runTask } from '../common';
import { relative } from 'path';


export async function copyIOS(config: Config) {
  const webAbsDir = config.app.webDir;
  const nativeAbsDir = config.ios.webDir;

  const webRelDir = relative(config.app.rootDir, webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, nativeAbsDir);

  await runTask(`Copying ${webRelDir} -> ${nativeRelDir}`, async () => {
    await emptyDirAsync(nativeAbsDir);
    await copy(webAbsDir, nativeAbsDir);
  });
}
