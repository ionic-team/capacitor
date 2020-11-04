import { WebPlugin } from '../../../index';

import type { LegacyPlugin } from './definitions';

export interface PluginListenerHandle {
  remove: () => void;
}

export class LegacyPluginWeb extends WebPlugin implements LegacyPlugin {
  listenerFunction: any = null;

  constructor() {
    super({
      name: 'Legacy',
      platforms: ['web'],
    });
  }

  getStatus(): Promise<string> {
    return new Promise(resolve => {
      resolve('all good');
    });
  }
}

const Legacy = new LegacyPluginWeb();

export { Legacy };
