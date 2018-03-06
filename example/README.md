# Capacitor Example App

This Example app can be used to develop Capacitor. It uses Capacitor to create native iOS and Android apps, the web app itself is an Ionic app, but the important bit is that the native apps are set up in a way that enables development of the native code by loading it from the parent folder instead of as an external dependency.

Note: This project does _not_ use the Capacitor CLI. Please follow the steps below to build, prepare and run the apps.

## 1. Build Capacitor Core Module

Start by building the Capacitor Core Module in `/core`:

```bash
cd ../core

npm install
npm run build
npm link
```

## 2. Build Example App

Switch back over to this example project in `/example` where you first install dependencies and link in the `@capacitor/core` you just built in the step before, then build the app and copy the build files to the correct `public` directories for both the iOS and Android example apps:

```bash
cd ../example

npm install
npm link @capacitor/core

npm run build
npm run copy
```

## 3. Build the native Capacitor Apps

Now that everything is in place you can build the native Capacitor Apps:

### a) Build iOS App

```bash
Open in XCode
example/ios/IonicRunner/IonicRunner.xcodeproj
```

### b) Build Android App

```bash
Open in Android Studio
example/android
```
