import { WebPlugin } from './index';

import {
  ClipboardPlugin,
  ClipboardWrite,
  ClipboardRead,
  ClipboardReadResult
} from '../core-plugin-definitions';

declare var navigator: any;

export class ClipboardPluginWeb extends WebPlugin implements ClipboardPlugin {
  constructor() {
    super({
      name: 'Clipboard',
      platforms: ['web']
    });
  }

  async write(options: ClipboardWrite): Promise<void> {
    if (!navigator.clipboard) {
      return Promise.reject('Clipboard API not available in this browser');
    }

    if (options.string || options.url) {
      await navigator.clipboard.writeText(options.string || options.url);
    } else if (options.image) {
      return Promise.reject("Setting images not supported on the web");
    }
    return Promise.resolve();
  }

  async read(_options: ClipboardRead): Promise<ClipboardReadResult> {
    if (!navigator.clipboard) {
      return Promise.reject('Clipboard API not available in this browser');
    }
    if (_options.type === 'string' || _options.type === 'url') {
      const text = await navigator.clipboard.readText();
      return Promise.resolve({ value: text});
    } else {
      const data = await navigator.clipboard.read();
      for (const item of data.items) {
        if (item.type === 'text/plain') {
          return Promise.resolve({ value: item.getAs('text/plain')});
        }
      }
    }
    return Promise.reject('Unable to get data from clipboard');
  }
}

const Clipboard = new ClipboardPluginWeb();

export { Clipboard };
