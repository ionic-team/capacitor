import { copyTemplate, runTask } from '../common';
import { Config } from '../config';
import { basename, relative } from 'path';
import { removeAsync } from '../util/fs';

export async function copyElectron(config: Config) {
  const chalk = require('chalk');
  const webAbsDir = config.app.webDirAbs;
  const webRelDir = basename(webAbsDir);
  const nativeRelDir = relative(config.app.rootDir, config.electron.webDirAbs);
  return await runTask(`Copying web assets from ${chalk.bold(webRelDir)} to ${chalk.bold(nativeRelDir)}`, async () => {
    await removeAsync(config.electron.webDirAbs);
    return copyTemplate(webAbsDir, config.electron.webDirAbs);
  });
}
