# Using Capacitor with Ionic

## Install Capacitor into an Ionic project
Capacitor is easily installed directly into any Ionic project (1.0-4.x+).

### New Ionic Project

```bash
ionic start myApp tabs --capacitor
cd myApp
```

### Existing Ionic Project

```bash
cd myApp
ionic integrations enable capacitor
```

### Initialize Capacitor with your app information

*Note: `npx` is a new utility available in npm 5 or above that executes local binaries/scripts to avoid global installs.*

```bash
npx cap init [appName] [appId]
```

where `appName` is the name of your app, and `appId` is the domain identifier of your app (ex: `com.example.app`).

*Note: Use the native IDEs to change these properties after initial configuration.*

### Build your Ionic App

You must build your Ionic project at least once before adding any native platforms.

```bash
ionic build
```

This creates the `www` folder that Capacitor has been [automatically configured](/docs/basics/configuring-your-app) to use as the `webDir` in `capacitor.config.json`.

### Add Platforms

```bash
npx cap add ios
npx cap add android
```

Both `android` and `ios` folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your Ionic app (i.e., check them into source control, edit them in their own IDEs, etc.).

### Open IDE to build, run, and deploy

```bash
npx cap open ios
npx cap open android
```

The native iOS and Android projects are opened in their standard IDEs (Xcode and Android Studio, respectively). Use the IDEs to run and deploy your app.

## Syncing your app with Capacitor

Every time you perform a build (e.g. `ionic build`) that changes your web directory (default: `www`), you'll need to copy those changes down to your native projects:

```bash
npx cap copy
```

## Using Ionic Native

[Ionic Native](https://ionicframework.com/docs/native/) is supported in Capacitor. Currently, Ionic Native contains only Cordova plugins, so whenever you find an Ionic Native wrapper you'd like to use, install it and then install the corresponding Cordova plugin by running

```bash
npm install your-cordova-plugin
npx cap update
```

See the [Cordova](/docs/basics/cordova) guide for more information.
