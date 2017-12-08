import { Config } from '../config';
import { logInfo } from '../common';


export async function openAndroid(config: Config) {
  return logInfo(`Android project location: ${config.android.platformDir}`);
}
