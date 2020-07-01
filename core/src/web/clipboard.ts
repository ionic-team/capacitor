import { WebPlugin } from './index';

import {
  ClipboardPlugin,
  ClipboardWrite,
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

    if (options.string !== undefined || options.url) {
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
      } catch (err) {
        return Promise.reject('Failed to write image');
      }
    } else {
      return Promise.reject('Nothing to write');
    }
    return Promise.resolve();
  }

  async read(): Promise<ClipboardReadResult> {
    if (!navigator.clipboard) {
      return Promise.reject('Clipboard API not available in this browser');
    }
    if (!navigator.clipboard.read) {
      if (!navigator.clipboard.readText) {
        return Promise.reject('Reading from clipboard not supported in this browser');
      }
      return this.readText();
    } else {
      try {
        const clipboardItems = await navigator.clipboard.read();
        const type = clipboardItems[0].types[0];
        const clipboardBlob = await clipboardItems[0].getType(type);
        const data = await this._getBlobData(clipboardBlob, type);
        return Promise.resolve({ value: data, type});
      } catch (err) {
        return this.readText();
      }
    }
  }

  private async readText() {
    const text = await navigator.clipboard.readText();
    return Promise.resolve({ value: text, type: 'text/plain'});
  }

  private _getBlobData(clipboardBlob: Blob, type: string) {
    return new Promise<string>((resolve, reject) => {
      var reader = new FileReader();
      if (type.includes('image')) {
        reader.readAsDataURL(clipboardBlob);
      } else {
        reader.readAsText(clipboardBlob);
      }
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
