import { WebPlugin, AppPlugin, AppLaunchUrl } from '@capacitor/core';

const { remote, shell, app } = require('electron');

export class AppPluginElectron extends WebPlugin implements AppPlugin {
  constructor() {
    super({
      name: 'App',
      platforms: ['electron']
    });
  }

  exitApp(): never {
    let w = remote.getCurrentWindow();
    w && w.close();
    throw new Error('App quit');
  }
  restartApp(): never {
    // https://www.electronjs.org/docs/api/app#apprelaunchoptions
    app.relaunch();
    app.exit();
    throw new Error('App restart');
  }
  canOpenUrl(_options: { url: string; }): Promise<{ value: boolean; }> {
    return Promise.resolve({ value: true });
  }
  openUrl(options: { url: string; }): Promise<{ completed: boolean; }> {
    shell.openExternal(options.url);
    return Promise.resolve({ completed: true });
  }
  getLaunchUrl(): Promise<AppLaunchUrl> {
    throw new Error('Method not implemented.');
  }
}

const App = new AppPluginElectron();

export { App };
