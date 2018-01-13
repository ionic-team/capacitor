# Capacitor Plugins

Plugins in Capacitor are centered around JavaScript modules that call into Capacitor's runtime to perform
actions on the underlying platform.

Plugins thus consist of a simple JavaScript layer installed through `npm`, and then platform specific
dependencies that are managed by each platform's dependency manager of choice.

## Installing a Plugin

Found a plugin you like? First, install its JS library through npm:

```bash
npm install --save capacitor-plugin-guacamole
```

Some plugins support iOS, Android, Electron, the web, or only a subset of those options.

## Installing Plugin for iOS

For a CocoaPod based plugin, cd into your `ios` platform directory and run

## Installing Plugin for Android