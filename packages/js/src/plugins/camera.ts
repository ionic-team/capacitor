import { AvocadoPlugin, Plugin } from '../plugin';

declare var window;

export interface CameraOptions {
  flashMode?: "on"|"off"|"auto";
  cameraDirection?: "front"|"rear";
  enableFrontFlash?: boolean;
}

@AvocadoPlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {
  constructor() { super(); }

  open(options: CameraOptions) {
    return this.nativePromise('open', options)
  }
}