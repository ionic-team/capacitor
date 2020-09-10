import { WebPlugin } from './index';

import { SharePlugin, ShareOptions } from '../core-plugin-definitions';

declare let navigator: any;

export class SharePluginWeb extends WebPlugin implements SharePlugin {
  constructor() {
    super({ name: 'Share' });
  }

  share(options?: ShareOptions): Promise<void> {
    if (!navigator.share) {
      return Promise.reject('Web Share API not available');
    }

    return navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
  }
}

const Share = new SharePluginWeb();

export { Share };
