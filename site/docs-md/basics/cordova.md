# Using Cordova Plugins

Capacitor comes with full Cordova plugin compatibility, so using existing Cordova plugins in Capacitor is easy.

## Installing Cordova Plugins

Simply `npm install` your plugin of choice, sync your project, finish configuration, and you're ready to go:

```bash
npm install cool-cordova-plugin
npx cap sync
```

## Important: Configuration 

Capacitor does not support Cordova install variables, auto configuration, or hooks, due to our philosphy of letting you control your native project source code (meaning things like hooks are unncessary). If your plugin requires variables or settings to be set, you'll need to apply those configuration settings manually by mapping between the plugin's `plugin.xml` and required settings on iOS and Android.

Consult the [iOS](../ios/configuration) and [Android](../android/configuration) configuration guides for info on how to configure each platform.

## Compatibility Issues

The following plugins don't work with Capacitor, or Capacitor provides a conflicting alternative. These plugins should be removed for your app:

- cordova-plugin-splashscreen: Capacitor provides its own API


While we've tested a number of popular Cordova plugins, it's possible Capacitor doesn't support every Cordova plugin. If you find an issue with an existing Cordova plugin, please [file an issue](https://github.com/ionic-team/capacitor/issues/new) with the issue you've found and the plugin information.