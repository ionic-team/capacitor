import { Config } from '../config';
import { log, runTask } from '../common';
import { getPlugins } from '../plugin';
import { getAndroidPlugins } from './common';
import { copyPluginsJS } from '../tasks/update';


export async function updateAndroid(config: Config, needsUpdate: boolean) {
  config;
  needsUpdate;

  const plugins = await runTask('Fetching plugins', async () => {
    const allPlugins = await getPlugins();
    const androidPlugins = await getAndroidPlugins(allPlugins);
    return androidPlugins;
  });

  await copyPluginsJS(config, plugins, "android");

  await runTask(`Updating android`, async () => {
    log('\n');
    return Promise.resolve();
  });
}
