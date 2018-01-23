import { Config } from '../config';
import { log, runTask } from '../common';


export async function updateAndroid(config: Config, needsUpdate: boolean) {
  config;
  needsUpdate;

  await runTask(`Updating android`, async () => {
    log('\n');
    return Promise.resolve();
  });
}
