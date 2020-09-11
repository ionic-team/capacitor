import type {
  AppPlugin,
  AppLaunchUrl,
  AppState,
} from '../core-plugin-definitions';

import { WebPlugin } from './index';

export class AppPluginWeb extends WebPlugin implements AppPlugin {
  constructor() {
    super({ name: 'App' });

    if (typeof document !== 'undefined') {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange.bind(this),
        false,
      );
    }
  }

  exitApp(): never {
    throw new Error('Method not implemented.');
  }

  canOpenUrl(_options: { url: string }): Promise<{ value: boolean }> {
    return Promise.resolve({ value: true });
  }

  openUrl(_options: { url: string }): Promise<{ completed: boolean }> {
    return Promise.resolve({ completed: true });
  }

  getLaunchUrl(): Promise<AppLaunchUrl> {
    return Promise.resolve({ url: '' });
  }

  getState(): Promise<AppState> {
    return Promise.resolve({ isActive: document.hidden !== true });
  }

  handleVisibilityChange(): void {
    const data = {
      isActive: document.hidden !== true,
    };

    this.notifyListeners('appStateChange', data);
  }
}

const App = new AppPluginWeb();

export { App };
