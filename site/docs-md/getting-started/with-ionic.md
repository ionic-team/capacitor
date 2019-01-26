# Using Capacitor with Ionic

## Install Capacitor into an Ionic project

Capacitor installs directly into any Ionic project (1.0-4.x+) with a simple `npm install`:

### Start Ionic Project

```bash
ionic start myApp tabs
cd myApp
```

Select "N" when asked to add Cordova.

### Build your Ionic App

You must run `npm run build` at least once to create the `www` folder:

```bash
npm run build
```

### Install Capacitor

Next, install capacitor into your project:

```bash
npm install --save @capacitor/cli @capacitor/core
```

### Init Capacitor with your app information

```
npx cap init [appName] [appId]
```

where `appName` is the name of your app, and `appId` is the domain identifier of your app (ex: `com.example.app`).

### Add Platforms

```bash
npx cap add ios
npx cap add android
```

### Open IDE to build

```bash
npx cap open ios
npx cap open android
```

## Syncing your app with Capacitor

Every time you perform a build (e.g. `npm run build`) that changes your web directory (default: `www`), you'll need to copy those changes down to your native projects:

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
