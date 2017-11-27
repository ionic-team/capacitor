import { AvocadoPlugin, Plugin } from '../plugin';

declare var window;

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
}

@AvocadoPlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {
  constructor() { super(); }

  getPhoto(options: CameraOptions) {
    return this.nativePromise('getPhoto', options)
  }
}