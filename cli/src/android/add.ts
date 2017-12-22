import { copy } from 'fs-extra';
import { Config } from '../config';
import { runTask } from '../common';


export async function addAndroid(config: Config) {

  await runTask(`Adding native android project in: ${config.android.platformDir}`, () => {
    return copy(config.android.assets.templateDir, config.android.platformDir);
  });

}
