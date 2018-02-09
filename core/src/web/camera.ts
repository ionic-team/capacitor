import { WebPlugin } from './index';

import {
  CameraPlugin,
  CameraPhoto,
  CameraOptions
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
      var modalController:any = document.querySelector('ion-modal-controller');

      if (!modalController) {
        modalController = document.createElement('ion-modal-controller');
        document.body.appendChild(modalController)
      }

      await modalController.componentOnReady();

      const camera = document.createElement('ion-camera');

      camera.addEventListener('onPhoto', async (e: any) => {
        const photo = e.detail;

        if (photo === null) {
          reject();
        } else {
          resolve(await this.getCameraPhoto(photo));
        }

        modalController.dismiss();
      })

      const modal = await modalController.create({
        component: camera
      });

      modal.present();
    });
  }

  getCameraPhoto(photo: Blob) {
    return new Promise<CameraPhoto>((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(photo); 
      reader.onloadend = () => {
        resolve({
          base64_data: reader.result,
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
