import { WebPlugin } from './index';

import {
  SplashScreenPlugin,
  SplashScreenHideOptions,
  SplashScreenShowOptions,
} from '../core-plugin-definitions';

export class SplashScreenPluginWeb
  extends WebPlugin
  implements SplashScreenPlugin {
  constructor() {
    super({ name: 'SplashScreen' });
  }

  show(
    _options?: SplashScreenShowOptions,
    _callback?: (...args: any[]) => any,
  ): Promise<void> {
    return Promise.resolve();
  }

  hide(
    _options?: SplashScreenHideOptions,
    _callback?: (...args: any[]) => any,
  ): Promise<void> {
    return Promise.resolve();
  }
}

const SplashScreen = new SplashScreenPluginWeb();

export { SplashScreen };
