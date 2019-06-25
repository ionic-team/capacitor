import { WebPlugin } from './index';

import {
  SharePlugin,
  ShareOptions
} from '../core-plugin-definitions';

declare var navigator:any;

export class SharePluginWeb extends WebPlugin implements SharePlugin {
  constructor() {
    super({
      name: 'Share',
      platforms: ['web']
    });
  }

  share(options?: ShareOptions): Promise<void> {
    if (!navigator.share) {
      return Promise.reject("Web Share API not available");
    }
    if (!options.files) {
      return navigator.share({
        title: options.title,
        text: options.text,
        url: options.url
      });
    }
    if (!(navigator.canShare && navigator.canShare({files: options.files}))) {
      return Promise.reject("Web Share API Level 2 not available");
    }
    return navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
      files: options.files
    });

  }
}

const Share = new SharePluginWeb();

export { Share };
