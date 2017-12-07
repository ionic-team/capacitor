import { copy } from 'fs-extra';
import { Config } from '../config';
import { runTask } from '../common';


export async function createAndroid(config: Config) {

  await runTask(`Creating native android project in: ${config.android.platformDir}`, () => {
    return copy(config.android.assets.templateDir, config.android.platformDir);
  });

}
