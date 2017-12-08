import { Config } from '../config';
import { logInfo } from '../common';


export async function openAndroid(config: Config) {
  return logInfo(`Android project found in: ${config.android.platformDir}`);
}
