# Using Capacitor in an Ionic Angular 4 App

Platforms: Web, iOS, Android

Capacitor makes it easy to build web apps that run natively on iOS, Android, desktop, and the web. In this guide, we'll add Camera functionality to an Ionic Angular 4 app that works on the web, iOS, and Android. Ready to capture photos using just one JavaScript method call?  Let's get started.

## Required Dependencies
Building and deploying iOS and Android apps require additional dependencies, including an iOS and Android device. Please [follow the instructions here](../getting-started/dependencies) before continuing.

## Prepare an Ionic 4 App
If you have an existing Ionic 4 app, skip this section. If not, let's create an Ionic app first. In a Terminal, install Ionic (this also updates to the latest version of Ionic):

```bash
npm install -g ionic
```

Next, create a new Ionic 4 app based on the "tabs" starter project:

```bash
ionic start capApp tabs
```

## Add Capacitor
Capacitor was designed to drop into any existing modern JavaScript web app - Ionic included!

```bash
cd capApp
npm install @capacitor/core @capacitor/cli
```

Next, initialize Capacitor with your app information.

```bash
npx cap init
```

App name: CapApp
App Package ID: com.example.capapp

## Build the App Once
Before adding any native platforms to this project, the app must be built at least once. A web build creates the web assets directory that Capacitor needs (`www` folder in Ionic projects).

```bash
ionic build
```

Next, add any platforms (besides the web, of course) that you'd like to build for.

```bash
npx cap add ios
npx cap add android
```

Upon running these commands, both `android` and `ios` folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your Ionic app (i.e., check them into source control).

## Adding Camera Functionality
Next up, we'll add the ability to take photos with the device's camera using the Capacitor [Camera API](../apis/camera).

To begin, open the Tab2 HTML page under the `src/app/tab2` folder. Add an image tag that will display the current photo taken with the camera and add an Ionic fab button that will open the camera when clicked:

```html
<ion-content>
  <img [src]="photo" >

  <ion-fab vertical="bottom" horizontal="center" slot="fixed">
    <ion-fab-button (click)="takePicture()">
      <ion-icon name="camera"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
```

Next, we need to add the logic that will power the camera functionality. Open `src/app/tab2/tab2.page.ts`  and import the Capacitor Plugins and Camera classes:

```typescript
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
```

Next, implement the `takePicture()` method:

```typescript
export class Tab2Page {
  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64Data));
  }
}
```

Notice the magic here: there's no mention of iOS or Android! There's just one method call - `Camera.getPhoto()` - that will open up the device's camera and allow us to take photos.

Next, we need to tell Angular to trust the dynamic image data. To do this, inject `DomSanitizer` via the Constructor and use `sanitizer.bypassSecurityTrustResourceUrl( )` to allow the image data to be displayed in our app:

```typescript
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export class Tab2Page {
  photo: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {  }
}
```

Here's the complete Camera implementation:

```typescript
import { Component } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  photo: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.base64Data));
  }
}
```

Let's give this a try in the browser:

```shell
ionic serve
```

Open the Developer Tools and select the `Console` tab. Then, navigate over to Tab Two, then click the newly created Camera fab button. An error appears in the Console:

`ERROR Error: Uncaught (in promise): TypeError: cameraModal.present is not a function`

Some Capacitor plugins, including the Camera, provide the web-based functionality and UI via the Ionic [PWA Elements library](https://github.com/ionic-team/ionic-pwa-elements). It's a separate dependency, so install it using the Terminal (cancel the `ionic serve` command currently running first):

```shell
npm install @ionic/pwa-elements
```

BROKEN - see evernote. using script tag in index.html for now!
<script src="https://unpkg.com/@ionic/pwa-elements@1.0.0/dist/ionicpwaelements.js"></script>

With that appropriately configured now, re-run `ionic serve` and click the Camera fab button. If your computer has a webcam of any sort, a modal window displays and you can take a photo!

[insert photo]

Next up, let's run this app on iOS and Android.

## iOS
Capacitor iOS apps are configured and managed through Xcode, with dependencies managed by CocoaPods. Before running this app on an iOS device, there's a couple of steps to complete.

From the Terminal, run the Capacitor `sync` command, which updates all native code dependencies as well as copies all web assets (the Ionic Angular app in this case) into the native iOS project.

```shell
npx cap sync
```

Next, run the Capacitor `open` command, which opens the native iOS project in Xcode:

```shell
npx cap open ios
```

Within Xcode, click on `App` in the Project Navigator on the left-hand side, then within the `Signing` section, select your Development Team. 

[IMAGE]

Next, for the Camera plugin to work, we must configure the "Privacy - Camera Usage" permission. A modal dialog displays automatically after the first time that `Camera.getPhoto( )` is called, prompting the user to allow the app to use the Camera. To set this, the `Info.plist` file must be modified ([more details here](../ios/configuration/)). To access it, click "Info," then expand "Custom iOS Target Properties."

Each setting in `Info.plist` has a low-level parameter name and a high-level name. By default, the property list editor shows the high-level names, but it's often useful to switch to showing the raw, low-level names. To do this, right-click anywhere in the property list editor and toggle "Show Raw Keys/Values."

Locate the `NSCameraUsageDescription` Key (or add it) and set the Value to something that describes why the app needs to use the camera, such as "To Take Photos." The Value will be displayed to the app user when the permission prompt opens.

With permissions in place, we are ready to try out the app on a real device! Connect an iOS device to your Mac computer, then within Xcode click the "Build" button to build, install, and launch the app on your device.

[IMAGE - build button]

Upon tapping the Camera button on Tab Two, the permission prompt will display. Tap OK, then take a picture with the Camera. Afterward, the photo shows in the app.

[IMAGE - permissions + photo]

## Android
Capacitor Android apps are configured and managed through Android Studio. Before running this app on an Android device, there's a couple of steps to complete.

From the Terminal, run the Capacitor `sync` command, which updates all native code dependencies as well as copies all web assets (the Ionic Angular app in this case) to the native Android project.

```shell
npx cap sync
```

Next, run the Capacitor `open` command, which opens the native Android project in Android Studio:

```shell
npx cap open android
```

Similar to iOS, we must enable the correct permissions to use the Camera. Configure these in the `AndroidManifest.xml` file. Android Studio will likely open this file automatically, but in case it doesn't, locate it under `android/app/src/main/`.

[IMAGE - android manifest]

Scroll to the `Permissions` section and ensure these entries are included:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

Save the file. With permissions in place, we are ready to try out the app on a real device! Connect an Android device to your computer. Within Android Studio, click the "Run" button, select the attached Android device, then click OK to build, install, and launch the app on your device.

[IMAGE - android device]

Once again, upon tapping the Camera button on Tab Two, the permission prompt should be displayed. Tap OK, then take a picture with the Camera. Afterward, the photo should appear in the app.

[image - android perms]

## What's Next?

We created a cross-platform Ionic Angular 4 app that runs on the web, Android, and iOS. Using the Capacitor Camera API, we added the ability to use the device's camera with just a few lines of code.

What's next? Try adding another API, such as [Toasts](../apis/toast) or [Push Notifications](../apis/push-notifications). Looking to create custom native functionality? Create a [Capacitor plugin](../plugins/). This is just the beginning of your Capacitor journey. 

Happy app building!