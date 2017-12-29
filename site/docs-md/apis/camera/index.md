# Camera

The Camera API allows a user to pick a photo from their photo album or take a picture. On iOS, this uses `UIImagePickerController`, and on Android this
API sends an intent which will be handled by the core Camera app by default.

## Example

```typescript
import { Plugins } from '@avocadojs/core';

Plugins.Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: 'base64'
}).then((image) => {
  // image.base64_data will contain the base64 encoded result as a JPEG. Make sure to
  // add the proper base64 image prefix:
  var imageUrl = 'data:image/jpeg;base64,' + image.base64_data;
  // can be set to the src of an image now
});
```

## Angular note

By default, Angular (>= 2.x) won't trust dynamic image urls. To trust the URL, inject `DomSanitizer` and make sure to allow the 
image URL to be trusted:

```typescript
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
  Plugins
} from '@avocadojs/core';

@IonicPage()
@Component({
  selector: 'page-camera',
  templateUrl: 'camera.html',
})
export class CameraPage {
  image: SafeResourceUrl;

  constructor(public navCtrl: NavController, public navParams: NavParams, private zone: NgZone, private sanitizer: DomSanitizer) {
  }

  getPhoto() {
    Plugins.Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'base64'
    }).then((image) => {
      this.image = this.sanitizer.bypassSecurityTrustResourceUrl(image && ('data:image/jpeg;base64,' + image.base64_data));
    });
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