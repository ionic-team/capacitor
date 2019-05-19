import { WebPlugin } from './index';

import { AppPlugin, AppLaunchUrl, } from '../core-plugin-definitions';

export class AppPluginWeb extends WebPlugin implements AppPlugin {
  constructor() {
    super({
      name: 'App',
      platforms: ['web']
    });
  }

  exitApp(): never {
    throw new Error("Method not implemented.");
  }

  canOpenUrl(_options: { url: string; }): Promise<{ value: boolean; }> {
    return Promise.resolve({ value: true });
  }

  openUrl(_options: { url: string; }): Promise<{ completed: boolean; }> {
    return Promise.resolve({ completed: true });
  }

  getLaunchUrl(): Promise<AppLaunchUrl> {
    return Promise.resolve({ url: '' });
  }
}

const App = new AppPluginWeb();

export { App };
