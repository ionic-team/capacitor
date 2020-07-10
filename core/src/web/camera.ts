import { WebPlugin } from './index';

import {
  CameraPlugin,
  CameraPhoto,
  CameraOptions,
  CameraResultType,
  CameraDirection,
  CameraSource
} from '../core-plugin-definitions';

export class CameraPluginWeb extends WebPlugin implements CameraPlugin {
  constructor() {
    super({
      name: 'Camera',
      platforms: ['web']
    });
  }

  async getPhoto(options: CameraOptions): Promise<CameraPhoto> {
    return new Promise<CameraPhoto>(async (resolve, reject) => {
      if (options.webUseInput) {
        this.fileInputExperience(options, resolve);
      } else {
        if (customElements.get('pwa-camera-modal')) {
          const cameraModal: any = document.createElement('pwa-camera-modal');
          document.body.appendChild(cameraModal);
          try {
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
          } catch (e) {
            this.fileInputExperience(options, resolve);
          }
        } else {
          console.error(`Unable to load PWA Element 'pwa-camera-modal'. See the docs: https://capacitorjs.com/docs/pwa-elements.`);
          this.fileInputExperience(options, resolve);
        }
      }
    });
  }

  private fileInputExperience(options: CameraOptions, resolve: any) {
    let input = document.querySelector('#_capacitor-camera-input') as HTMLInputElement;

    const cleanup = () => {
      input.parentNode && input.parentNode.removeChild(input);
    };

    if (!input) {
      input = document.createElement('input') as HTMLInputElement;
      input.id = '_capacitor-camera-input';
      input.type = 'file';
      document.body.appendChild(input);
    }

    input.accept = 'image/*';
    (input as any).capture = true;

    if (options.source === CameraSource.Photos || options.source === CameraSource.Prompt) {
      input.removeAttribute('capture');
    } else if (options.direction === CameraDirection.Front) {
      (input as any).capture = 'user';
    } else if (options.direction === CameraDirection.Rear) {
      (input as any).capture = 'environment';
    }

    input.addEventListener('change', (_e: any) => {
      const file = input.files[0];
      let format = 'jpeg';

      if (file.type === 'image/png') {
        format = 'png';
      } else if (file.type === 'image/gif') {
        format = 'gif';
      }

      if (options.resultType === CameraResultType.DataUrl || options.resultType === CameraResultType.Base64) {
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          if (options.resultType === CameraResultType.DataUrl) {
            resolve({
              dataUrl: reader.result,
              format
            } as CameraPhoto);
          } else if (options.resultType === CameraResultType.Base64) {
            const b64 = (reader.result as string).split(',')[1];
            resolve({
              base64String: b64,
              format
            } as CameraPhoto);
          }

          cleanup();
        });

        reader.readAsDataURL(file);
      } else {
        resolve({
          webPath: URL.createObjectURL(file),
          format: format
        });
        cleanup();
      }
    });

    input.click();
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
