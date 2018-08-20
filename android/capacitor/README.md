# Capacitor Android runtime [![Download](https://img.shields.io/bintray/v/ionic-team/capacitor/capacitor-android.svg)](https://bintray.com/ionic-team/capacitor/capacitor-android/_latestVersion) [![Twitter Follow](https://img.shields.io/twitter/follow/getcapacitor.svg?style=social&label=Follow&style=flat-square)](https://twitter.com/getcapacitor)

This is the Android runtime for Capacitor.
 
> Capacitor is a cross-platform app runtime that makes it easy to build web apps that run natively on iOS, Android, Electron, and the web.

## Development

### Logging

To make Capacitor's log stream better searchable by Logcat all Capacitor Android runtime and plugin log tags should have the same form.

Therefore the class `com.getcapacitor.LogUtils` with a **core** and **plugin** tag method should be used to get the log's tag string.

```
Log.i(LogUtils.getCoreTag(), "Your message");
Log.i(LogUtils.getPluginTag(), "Your plugin message");
```

These methods might have subTags: String[] param, joining the Strings together separated by a slash.

For plugins extending `com.getcapacitor.Plugin` the super method `com.getcapacitor.Plugin#getLogTag()` should be used, which builds the log tag using a prefix and the class name of the sub class.

Using this simple approach you are able to use the filter string `/Capacitor` in LogCat and get only log statements belonging to Capacitor or search by `Capacitor/Plugin` to get everything related to plugins and `/Capaci` to get every thing releated to Capacitor.

### Local testing




