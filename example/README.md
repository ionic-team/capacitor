Build Example
=====================

## Build Capacitor Core Module

```
cd to core

npm run build
npm link
```


## Build Example App

This will npm link to the Capacitor package, build the app, and copy the build files to the correct `public` directories for both the iOS and Android example apps.

```
cd to example

npm link @capacitor/core
npm run build
npm run copy
```


## Build iOS App

```
Open in XCode
example/ios/IonicRunner/IonicRunner.xcodeproj
```


## Build Android App

```
Open in Android Studio
example/android
```
