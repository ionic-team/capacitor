import { AvocadoPlugin, Plugin } from '../plugin';

declare var window;

@AvocadoPlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {
  constructor() { super(); }
  open() {
    return this.nativePromise('open')
  }
}