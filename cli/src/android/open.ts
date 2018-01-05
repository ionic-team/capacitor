import { Config } from '../config';
import { logInfo } from '../common';


export async function openAndroid(config: Config) {
  logInfo(`Opening Android project at ${config.android.platformDir}`);

  const opn = await import('opn');

  const dir = config.android.platformDir;

  switch(config.cli.os) {
    case 'mac':
      logInfo('Doing open now!');
      await opn(dir, { app: 'android studio', wait: false });
      break;
  }

}
