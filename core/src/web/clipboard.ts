import { WebPlugin } from './index';

import {
  ClipboardPlugin,
  ClipboardWrite,
  ClipboardRead,
  ClipboardReadResult
} from '../core-plugin-definitions';

declare var navigator: any;
declare var ClipboardItem: any;

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
      if (!navigator.clipboard.writeText) {
        return Promise.reject('Writting to clipboard not supported in this browser');
      }
      await navigator.clipboard.writeText(options.string !== undefined ? options.string : options.url);
    } else if (options.image) {
      if (!navigator.clipboard.write) {
        return Promise.reject('Setting images not supported in this browser');
      }
      try {
        const blob = await (await fetch(options.image)).blob();
        const clipboardItemInput = new ClipboardItem({[blob.type] : blob});
        await navigator.clipboard.write([clipboardItemInput]);
      }catch(err) {
        return Promise.reject('Failed to write image');
      }
    } else {
      return Promise.reject('Nothing to write');
    }
    return Promise.resolve();
  }

  async read(_options: ClipboardRead): Promise<ClipboardReadResult> {
    if (!navigator.clipboard) {
      return Promise.reject('Clipboard API not available in this browser');
    }
    if (_options.type === 'string' || _options.type === 'url') {
      if (!navigator.clipboard.readText) {
        return Promise.reject('Reading from clipboard not supported in this browser');
      }
      const text = await navigator.clipboard.readText();
      return Promise.resolve({ value: text});
    } else {
      if (navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        const imgBlob = await clipboardItems[0].getType('image/png');
        const data = await this._getBlobData(imgBlob);
        return Promise.resolve({ value: data});
      } else {
        return Promise.reject('Reading images not supported in this browser');
      }
    }
  }

  private _getBlobData(imgBlob: Blob) {
    return new Promise<string>((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(imgBlob);
      reader.onloadend = () => {
        const r = reader.result as string;
        resolve(r);
      };
      reader.onerror = (e) => {
        reject(e);
      };
    });
  }
}

const Clipboard = new ClipboardPluginWeb();

export { Clipboard };
