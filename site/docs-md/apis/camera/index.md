---
title: Camera
description: Camera API
url: /docs/apis/camera
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Camera

The Camera API allows a user to pick a photo from their photo album or take a picture. On iOS, this uses `UIImagePickerController`, and on Android this
API sends an intent which will be handled by the core Camera app by default.

<plugin-api index="true" name="camera"></plugin-api>

## iOS Notes

iOS requires the following usage description be added and filled out for your app in `Info.plist`:

Name: `Privacy - Camera Usage Description`  
Key: 	`NSCameraUsageDescription`

Name: `Privacy - Photo Library Additions Usage Description`  
Key: 	`NSPhotoLibraryAddUsageDescription`

Name: `Privacy - Photo Library Usage Description`  
Key: 	`NSPhotoLibraryUsageDescription`

Read about [Setting iOS Permissions](/docs/ios/configuration/) in the [iOS Guide](/docs/ios/) for more information on setting iOS permissions in Xcode

## Android Notes

This API requires the following permissions be added to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

The storage permissions are for reading/saving photo files.

Read about [Setting Android Permissions](/docs/android/configuration/) in the [Android Guide](/docs/android/) for more information on setting Android permissions.

Additionally, because the Camera API launches a separate Activity to handle taking the photo, you should listen for `appRestoredResult` in the `App` plugin
to handle any camera data that was sent in the case your app was terminated by the operating system while the Activity was running.

## PWA/Electron Notes

[PWA Elements](/docs/pwa-elements) are required for Camera plugin to work.

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
  // image.webPath will contain a path that can be set as an image src. 
  // You can access the original file using image.path, which can be 
  // passed to the Filesystem API to read the raw data of the image, 
  // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
  var imageUrl = image.webPath;
  // Can be set to the src of an image now
  imageElement.src = imageUrl;
}
```

## Example Guides

[Building an Ionic Framework Camera App](/docs/guides/ionic-framework-app)

## API

<plugin-api name="camera"></plugin-api>
