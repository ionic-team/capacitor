<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Camera

The Camera API allows a user to pick a photo from their photo album or take a picture. On iOS, this uses `UIImagePickerController`, and on Android this
API sends an intent which will be handled by the core Camera app by default.

<plugin-api index="true" name="camera"></plugin-api>

## iOS Notes

iOS requires the following usage description be added and filled out for your app in `Info.plist`:

Name: `Privacy - Camera Usage Description`
Key: 	`NSCameraUsageDescription`

Read about [Setting iOS Permissions](../ios/permissions/) in the [iOS Guide](../ios/) for more information on setting iOS permissions in Xcode

## Android Notes

This API requires the following permissions be added to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

The first permission is for Camera access, and the storage permissions are for reading/saving photo files.

Read about [Setting Android Permissions](../android/permissions/) in the [Android Guide](../android/) for more information on setting Android permissions.

Additionally, because the Camera API launches a separate Activity to handle taking the photo, you should listen for `appRestoredResult` in the `App` plugin
to handle any camera data that was sent in the case your app was terminated by the operating system while the Activity was running.

## Example

```typescript
import { Plugins, CameraResultType } from '@capacitor/core';

const { Camera } = Plugins;

async takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  // image.webPath will contain a path that can be set as an image src. You can access
  // the original file using image.path, which can be passed to the Filesystem API to
  // read the raw data of the image, if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
  var imageUrl = image.webPath;
  // can be set to the src of an image now
  imageElement.src = imageUrl;
}
```

## Angular example

By default, Angular (>= 2.x) won't trust dynamic image urls. To trust the URL, inject `DomSanitizer` and make sure to allow the 
image URL to be trusted.

This example also demonstrates how to set the default source of the image. By default, `getPhoto` will prompt the user to take a picture or select a photo from their existing photos. 

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';

@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  image: SafeResourceUrl;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone, private sanitizer: DomSanitizer) {
  }

  async takePicture() {
    const { Camera } = Plugins;

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    
    // Example of using the Base64 return type. It's recommended to use CameraResultType.Uri
    // instead for performance reasons when showing large, or a large amount of images.
    this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64Data));
  }
}
```

Component template:

```html
  <img [src]="image" />
  <button (click)="takePicture()" ion-button color="primary">Take Picture</button>
```

## API

<plugin-api name="camera"></plugin-api>
