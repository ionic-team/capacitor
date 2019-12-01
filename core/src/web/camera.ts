import { WebPlugin } from './index';

import {
  CameraPlugin,
  CameraPhoto,
  CameraOptions,
  CameraResultType
} from '../core-plugin-definitions';

export class CameraPluginWeb extends WebPlugin implements CameraPlugin {
  constructor() {
    super({
      name: 'Camera',
      platforms: ['web']
    });
  }

  async getPhoto(options: CameraOptions): Promise<CameraPhoto> {
    options;

    return new Promise<CameraPhoto>(async (resolve, reject) => {
      const cameraModal: any = document.createElement('pwa-camera-modal');
      document.body.appendChild(cameraModal);
      await cameraModal.componentOnReady();
      cameraModal.addEventListener('onPhoto', async (e: any) => {
        const photo = e.detail;

        if (photo === null) {
          reject('User cancelled photos app');
        } else if (photo instanceof Error) {
          reject(photo.message);
        } else {
          resolve(await this._getCameraPhoto(photo, options));
        }

        cameraModal.dismiss();
        document.body.removeChild(cameraModal);
      });

      cameraModal.present();
    });
  }

  private _getCameraPhoto(photo: Blob, options: CameraOptions) {
    return new Promise<CameraPhoto>((resolve, reject) => {
      var reader = new FileReader();
      var format = photo.type.split('/')[1];
      if (options.resultType === CameraResultType.Uri) {
        resolve({
          webPath: URL.createObjectURL(photo),
          format: format
        });
      } else {
        reader.readAsDataURL(photo);
        reader.onloadend = () => {
          const r = reader.result as string;
          if (options.resultType === CameraResultType.DataUrl) {
            resolve({
              dataUrl: r,
              format: format
            });
          } else {
            resolve({
              base64String: r.split(',')[1],
              format: format
            });
          }
        };
        reader.onerror = (e) => {
          reject(e);
        };
      }
    });
  }
}

const Camera = new CameraPluginWeb();

export { Camera };
