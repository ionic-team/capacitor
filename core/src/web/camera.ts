import { WebPlugin } from './index';

import {
  CameraPlugin,
  CameraPhoto,
  CameraOptions
} from '../core-plugin-definitions';

//import '@ionic/pwa-elements';

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
      const cameraModal: any = document.createElement('ion-pwa-camera-modal');
      document.body.appendChild(cameraModal);
      await cameraModal.componentOnReady();
      cameraModal.addEventListener('onPhoto', async (e: any) => {
        const photo = e.detail;

        if (photo === null) {
          reject();
        } else {
          resolve(await this._getCameraPhoto(photo));
        }

        cameraModal.dismiss();
      });

      cameraModal.present();
    });
  }

  private _getCameraPhoto(photo: Blob) {
    return new Promise<CameraPhoto>((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(photo);
      reader.onloadend = () => {
        resolve({
          base64Data: reader.result,
          webPath: reader.result,
          format: 'jpeg'
        });
      };
      reader.onerror = (e) => {
        reject(e);
      };
    });
  }
}

const Camera = new CameraPluginWeb();

export { Camera };
