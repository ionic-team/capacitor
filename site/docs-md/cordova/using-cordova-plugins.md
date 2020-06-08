---
title: Using Cordova Plugins and Ionic Native
description: Using Cordova Plugins and Ionic Native
url: /docs/cordova/using-cordova-plugins
contributors:
  - dotnetkow
---

# Using Cordova Plugins and Ionic Native

<p class="intro">When developing an app that uses Capacitor, it's possible to use both Cordova and Ionic Native plugins.</p>

## Installing Cordova Plugins

Simply install your plugin of choice, sync your project, finish any required native project configuration, and you're ready to go:

```bash
npm install cordova-plugin-name
npx cap sync
```

## Updating Cordova Plugins

Similar to the installation steps. Simply update the cordova plugin to the latest version then Capacitor will pick up the changes:

```bash
npm install cordova-plugin-name@latest
npx cap update
```

If you don't want to risk to introduce breaking changes, use `npm update cordova-plugin-name` instead of `@latest` as `update` respects semver.

## Installing Ionic Native Plugins
[Ionic Native](https://ionicframework.com/docs/native) provides TypeScript wrappers and a consistent API and naming convention for easier development with Cordova plugins. It's supported in Capacitor, so whenever you find an Ionic Native wrapper you'd like to use, install the JavaScript code, install the corresponding Cordova plugin, then sync your project:

```bash
npm install @ionic-native/javascript-package-name
npm install cordova-plugin-name
npx cap sync
```

## Updating Ionic Native Plugins

Similiar to the installation steps. Update the Ionic Native JavaScript library, remove then re-add the Cordova plugin, then update your project:

```bash
npm install @ionic-native/javascript-package-name@latest
npm install cordova-plugin-name@latest
npx cap update
```

If you don't want to risk to introduce breaking changes, use `npm update cordova-plugin-name` instead of `@latest`.

## Determining Installed Plugin Version

See the list of Capacitor and Cordova plugins (and their exact version numbers) installed in your project with:

```bash
npx cap ls
```

## Important: Configuration 

Capacitor does not support Cordova install variables, auto configuration, or hooks, due to our philosophy of letting you control your native project source code (meaning things like hooks are unnecessary). If your plugin requires variables or settings to be set, you'll need to apply those configuration settings manually by mapping between the plugin's `plugin.xml` and required settings on iOS and Android.

Consult the [iOS](/docs/ios/configuration) and [Android](/docs/android/configuration) configuration guides for info on how to configure each platform.

## Compatibility Issues

Some Cordova plugins don't work with Capacitor or Capacitor provides a conflicting alternative. [See here](/docs/cordova/known-incompatible-plugins) for details and a known incompatibility list.