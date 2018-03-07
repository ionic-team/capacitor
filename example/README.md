# Capacitor Example App

This example app can be used to develop and test Capacitor.

This project contains a modified Ionic app as the web app (source code in `src`, build in `www`), that demos the use of the Capacitor APIs (from `@capacitor/code`). The project is also already set up with two native projects, `ios` and `android`, that can be used to build and debug native apps for those platforms.

The installation instructions and native projects are set up in such a way, that `@capacitor/core` and the Capacitor Android and iOS libraries that are used in the native projects are loaded from the local (parent) directory, instead of as an external depdency through the normal distribution mechanism (npm, Cocoapods and Gradle/Bintray):

* `@capacitor/core` = `../core`
* Capacitor iOS = `../ios`
* Capacitor Android = `../android`

This way you can make direct changes to all those and use them in the native apps, allowing quick iteration of development.

Note: This project does _not_ use the Ionic or Capacitor CLIs. Please follow the steps below to build, prepare and run the apps.

## 1. Build Capacitor Core Module

Start by building the Capacitor Core Module in `/core`:

```
cd ../core

npm install
npm run build
npm link
```

## 2. Build Example App

Switch back over to this example project in `/example` where you first install dependencies and link in the `@capacitor/core` you just built in the step before, then build the app and copy the build files to the correct `public` directories for both the iOS and Android example apps:

```
cd ../example

npm install
npm link @capacitor/core

npm run build
npm run copy
```

## 3. Build and run the native Capacitor Apps

Now that everything is in place you can build the native Capacitor Apps:

### a) Build and run iOS App

Before you can run the project, you have to update the Cocoapods inside:

```
cd ios/IonicRunner
pod update
```

Open in Xcode: `example/ios/IonicRunner/IonicRunner.xcworkspace`

### b) Build and run Android App

Open in Android Studio: `example/android`
