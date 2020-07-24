import { Component, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins,
  CameraDirection,
  CameraResultType,
  CameraSource,
  FilesystemDirectory
} from '@capacitor/core';

const { Filesystem } = Plugins;

/**
 * Generated class for the CameraPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  image: SafeResourceUrl;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private zone: NgZone,
              private sanitizer: DomSanitizer) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CameraPage');
  }

  async getFileInput() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      webUseInput: true
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async getPhotoFront() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      direction: CameraDirection.Front,
      resultType: CameraResultType.DataUrl
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async getBase64() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    })
    console.log('Got image back', image.base64String, image.format);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (`data:${image.format};base64,${image.base64String}`));
  }

  async getPhotoPWAElements() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async getFromPhotos() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async takePictureScaled() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      width: 128
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async takePictureCorrected() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      width: 128,
      correctOrientation: true
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async takePictureFile() {
    const image = await Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    })
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);


    const imageData = await Filesystem.readFile({
      path: image.path
    });

    await Filesystem.writeFile({
      path: 'cool-photo.jpg',
      directory: FilesystemDirectory.Data,
      data: imageData.data
    });

    let stat = await Plugins.Filesystem.stat({
      path: 'cool-photo.jpg',
      directory: FilesystemDirectory.Data
    });

    console.log(stat);

    //this.image = this.sanitizer.bypassSecurityTrustResourceUrl("data:image/jpeg;base64," + imageData.data);
    const imageUrl = image.webPath;
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(imageUrl);
  }

  getCapacitorPath(url: string) {
    return url.replace("file://", "_capacitor_");
  }

  async testImageSize() {
    const image = await Plugins.Camera.getPhoto({
      allowEditing: false,
      correctOrientation: false,
      height: 1080,
      width: 1080,
      quality: 90,
      resultType: CameraResultType.DataUrl,
      saveToGallery: false
    });
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async testAndroidBreak() {
    const image = await Plugins.Camera.getPhoto({
      allowEditing: false,
      correctOrientation: true, // <------------ oups
      height: 1080,
      width: 1080,
      quality: 90,
      resultType: CameraResultType.DataUrl,
      saveToGallery: false, 
      source: CameraSource.Photos
    });
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  async takePicturePreservingAspectRatio() {
    const image = await Plugins.Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      saveToGallery: true,
      correctOrientation: true,
      height: 1920,
      width: 1920,
      preserveAspectRatio: true,
    });
    console.log('Got image back', image.path, image.webPath, image.format, image.exif);
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
  }
}
