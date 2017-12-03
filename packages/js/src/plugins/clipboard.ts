import { NativePlugin, Plugin } from '../plugin';


@NativePlugin({
  name: 'Clipboard',
  id: 'com.avocadojs.plugin.clipboard'
})
export class Clipboard extends Plugin {

  set(options: ClipboardSet) {
    return this.nativePromise('set', options);
  }

  get(options: ClipboardGet) {
    return this.nativePromise('get', options);
  }
}

export interface ClipboardSet {
  string?: string;
  image?: string;
  url?: string;
  label?: string; // Android only
}

export interface ClipboardGet {
  type: 'string' | 'url' | 'image';
}
