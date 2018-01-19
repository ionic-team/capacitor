import { WebPlugin } from './index';

import {
  SharePlugin,
  ShareOptions
} from '../core-plugin-definitions';

import { PermissionsRequestResult } from '../definitions';

import { extend } from '../util';

declare var navigator;

export class SharePluginWeb extends WebPlugin implements SharePlugin {
  constructor() {
    super({
      name: 'Share',
      platforms: ['web']
    });
  }

  share(options?: ShareOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.share) {
        reject("Web Share API not available");
        return;
      }

      return navigator.share({
        title: options.title,
        text: options.text,
        url: options.url
      });
    });
  }
}

const Share = new SharePluginWeb();

export { Share };
