import { NativePlugin, Plugin } from '../plugin';

@NativePlugin({
  name: 'Keyboard',
  id: 'com.avocadojs.plugin.keyboard'
})
export class Keyboard extends Plugin {
  init() {
    return this.nativePromise('init');
  }

  show() {
    return this.nativePromise('show');
  }

  hide() {
    return this.nativePromise('hide');
  }
}