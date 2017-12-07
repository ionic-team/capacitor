import { NativePlugin, Plugin } from '../plugin';

/**
 * The Camera API makes it easy to take photos.
 * 
 * On iOS, this API uses UIImagePickerController, and on Android the
 * an intent is generated to use the core Camera app.
 */
@NativePlugin({
  name: 'Camera',
  id: 'com.avocadojs.plugin.camera'
})
export class Camera extends Plugin {
  /**
   * Open the camera to take a photo. The photo
   * can be returned in a certain size, optionally
   * editied/cropped, and returned in either a URI
   * or base64.
   * @param options options for the camera
   */
  getPhoto(options: CameraOptions): Promise<CameraPhoto> {
    return this.nativePromise('getPhoto', options);
  }
}

export interface CameraOptions {
  quality?: number; // default: 100
  allowEditing?: boolean; // default: false
  resultType: 'base64' | 'uri';
  saveToGallery?: boolean; // default: true
}

export interface CameraPhoto {
  base64_data: string;
  format: string;
}
