import { Subprocess } from '@ionic/utils-subprocess';

import type { Config } from '../definitions';

export async function runAndroid(config: Config): Promise<void> {
  console.log(Subprocess);
}
