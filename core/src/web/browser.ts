import { WebPlugin } from './index';

import {
  BrowserPlugin,
  BrowserOpenOptions,
  BrowserPrefetchOptions
} from '../core-plugin-definitions';

export class BrowserPluginWeb extends WebPlugin implements BrowserPlugin {
  _lastWindow: Window;

  constructor() {
    super({
      name: 'Browser',
      platforms: ['web']
    });
  }

  async open(options: BrowserOpenOptions): Promise<void> {
    this._lastWindow = window.open(options.url, options.windowName || '_blank');
    return Promise.resolve();
  }

  async prefetch(_options: BrowserPrefetchOptions): Promise<void> {
    // Does nothing
    return Promise.resolve();
  }

  async close() {
    this._lastWindow && this._lastWindow.close();
    return Promise.resolve();
  }
}

const Browser = new BrowserPluginWeb();

export { Browser };
