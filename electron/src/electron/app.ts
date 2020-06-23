import { WebPlugin, AppPlugin, AppPluginWeb, AppLaunchUrl, AppState } from '@capacitor/core';

const { remote, shell } = require('electron');
const webApp = new AppPluginWeb();

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
  getState(): Promise<AppState> {
    return webApp.getState();
  }
}

const App = new AppPluginElectron();

export { App };
