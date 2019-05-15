---
title: Using Cordova Plugins
description: Capacitor offers full Cordova plugin compatibility
url: /docs/basics/cordova
contributors:
  - jcesarmobile
  - dotnetkow
---

# Using Cordova Plugins

Capacitor comes with full Cordova plugin compatibility, so using existing Cordova plugins in Capacitor is easy.

## Installing Cordova Plugins

Simply `npm install` your plugin of choice, sync your project, finish configuration, and you're ready to go:

```bash
npm install cool-cordova-plugin
npx cap sync
```

## Important: Configuration 

Capacitor does not support Cordova install variables, auto configuration, or hooks, due to our philosophy of letting you control your native project source code (meaning things like hooks are unnecessary). If your plugin requires variables or settings to be set, you'll need to apply those configuration settings manually by mapping between the plugin's `plugin.xml` and required settings on iOS and Android.

Consult the [iOS](../ios/configuration) and [Android](../android/configuration) configuration guides for info on how to configure each platform.

## Compatibility Issues

Some Cordova plugins don't work with Capacitor, or Capacitor provides a conflicting alternative. If it's known that the plugin is conflicting or causes build issues, it will be skipped when running `npx cap update`.


While we've tested a number of popular Cordova plugins, it's possible Capacitor doesn't support every Cordova plugin. If you find an issue with an existing Cordova plugin, please [file an issue](https://github.com/ionic-team/capacitor/issues/new) with the issue you've found and the plugin information.