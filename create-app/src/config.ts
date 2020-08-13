import fs from 'fs';
import util from 'util';
import { resolve } from 'path';

import { OptionValues } from './options';

const writeFile = util.promisify(fs.writeFile);

export const createConfigFile = async ({
  name: appName,
  dir,
  'package-id': appId,
}: OptionValues) => {
  const config = {
    appId,
    appName,
    webDir: 'www',
    plugins: {
      SplashScreen: {
        launchShowDuration: 0,
      },
    },
  };

  await writeFile(
    resolve(dir, 'capacitor.config.json'),
    JSON.stringify(config, undefined, 2),
  );
};
