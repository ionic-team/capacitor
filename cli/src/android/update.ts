import { Config } from '../config';
import { runTask } from '../common';


export async function updateAndroid(config: Config, needsUpdate: boolean) {
  config;
  needsUpdate;

  await runTask(`Updating android`, async () => {
    return Promise.resolve();
  });
}
