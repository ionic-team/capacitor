---
title: Migrating from Cordova to Capacitor
description: Migrating from Cordova to Capacitor
url: /docs/cordova/migrating-from-cordova-to-capacitor
contributors:
  - dotnetkow
---

# Migrating a Web App Using Cordova to Capacitor

<p class="intro">There are several steps required to fully migrate a web app using Cordova over to Capacitor.</p>

<blockquote>
Note that it's recommended to work in a separate code branch when applying these changes.
</blockquote>

## Add Capacitor

Begin by opening your project in a Terminal, then add Capacitor to [a web app](/docs/getting-started) or [an Ionic app](/docs/getting-started/with-ionic). 

Next, open `config.xml` and find the `id` field in the widget element. In this example, it's `io.ionic.myapp`.

```xml
<widget id="io.ionic.myapp" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

Also find the `Name` of your app:

```xml
<name>MyApp</name>
```

Now, initialize Capacitor with this app information:

```bash
npx cap init [appName] [appId]
```

In this example, it would be `npx cap init MyApp io.ionic.myapp`. These values can be found in the newly created `capacitor.config.json` file.

### Build your Web App
You must build your web project at least once before adding any native platforms.

This ensures that the `www` folder that Capacitor has been [automatically configured](/docs/basics/configuring-your-app/) to use as the `webDir` in `capacitor.config.json` actually exists.

### Add Platforms

Capacitor native platforms exist in their own top-level folders. Cordova's are located under `platforms/ios` or `platforms/android`.

```bash
npx cap add ios
npx cap add android
```

Both android and ios folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your app (i.e., check them into source control, edit them in their own IDEs, etc.). Additionally, any Cordova plugins that were previously added to the project via `npm install` (located under `dependencies` in `package.json`) are automatically installed by Capacitor into each new native project (minus any [incompatible ones](/docs/cordova/known-incompatible-plugins)):

```json
"dependencies": {
    "@ionic-native/camera": "^5.3.0",
    "@ionic-native/core": "^5.3.0",
    "@ionic-native/file": "^5.3.0",
    "cordova-android": "8.0.0",
    "cordova-ios": "5.0.0",
    "cordova-plugin-camera": "4.0.3",
    "cordova-plugin-file": "6.0.1",
}
```

## Splash Screens and Icons

If you've previously created icon and splash screen images, they can be found in the top-level `resources` folder of your project. With those images in place, you can use the `cordova-res` tool to generate icons and splash screens for Capacitor-based iOS and Android projects.

First, install `cordova-res`:

```bash
$ npm install -g cordova-res
```

Next, run the following to regenerate the images and copy them into the native projects:

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```

[Complete details here](https://github.com/ionic-team/cordova-res#capacitor).

## Migrate Plugins

Begin by auditing your existing Cordova plugins - it's possible that you may be able to remove ones that are no longer needed. 

Next, review all of Capacitor's [core plugins](/docs/apis) as well as [community plugins](/docs/community/plugins). You may be able to switch to the Capacitor-equivalent Cordova plugin.

Some plugins may not match functionality entirely, but based on the features you need that may not matter.

Note that any plugins that are [incompatible or cause build issues](/docs/cordova/known-incompatible-plugins) are automatically skipped.

### Remove Cordova Plugin

After replacing a Cordova plugin with a Capacitor one (or simply removing it entirely), uninstall the plugin then run the `sync` command to remove the plugin code from a native project:

```bash
npm uninstall cordova-plugin-name
npx cap sync [android | ios]
```

## Set Permissions

By default, the entire initial permissions requested for the latest version of Capacitor are set for you in the default native projects for both iOS and Android. However, you may need to apply additional permissions manually by mapping between `plugin.xml` and required settings on iOS and Android. Consult the [iOS](/docs/ios/configuration) and [Android](/docs/android/configuration) configuration guides for info on how to configure each platform.

## Cordova Plugin preferences

When `npx cap init` is run, Capacitor reads all the preferences in `config.xml` and port them to `capacitor.config.json` file. You can manually add more preferences to the `cordova.preferences` object too.

```json
{
  "cordova": {
    "preferences": {
      "DisableDeploy": "true",
      "CameraUsesGeolocation": "true"
    }
  }
}
```


## Additional Config.xml Fields

You may be curious about how other elements from `config.xml` work in Capacitor apps.

The Author element can be configured in `package.json`, but is not used by Capacitor or within your app:

```xml
<author email="email@test.com" href="http://ionicframework.com/">Ionic Framework Team</author>
```

Most of the `allow-intent` values are either not used or there are [configurable alternatives](/docs/basics/configuring-your-app/) in `capacitor.config.json`.

```xml
<allow-intent href="http://*/*" />
<allow-intent href="https://*/*" />
<allow-intent href="tel:*" />
<allow-intent href="sms:*" />
<allow-intent href="mailto:*" />
<allow-intent href="geo:*" />
```

iOS `edit-config` elements need to be [configured in Info.plist](/docs/ios/configuration).

```xml
<edit-config file="*-Info.plist" mode="merge" target="NSCameraUsageDescription">
    <string>Used to take photos</string>
</edit-config>
```

It's impossible to cover every `config.xml` element available. However, most questions relating to "How do I configure X in Capacitor?" should be thought of as "How do I configure X in [platform] (iOS/Android)?" when searching online for answers.

## Setting Scheme

When using Ionic with Cordova, your app uses `cordova-plugin-ionic-webview` by default, which on iOS uses `ionic://` scheme for serving the content. Capacitor apps use `capacitor://` as default scheme on iOS. This means that using a origin-binded Web API like LocalStorage, will result in a loss of data as the origin is different. This can be fixed by changing the scheme that is used for serving the content:

```json
{
  "server": {
    "iosScheme": "ionic"
  }
}
```

## Removing Cordova

Once you've tested that all migration changes have been applied and the app is working well, Cordova can be removed from the project. Delete `config.xml` as well as the `platforms` and `plugins` folders. Note that you don't technically have to remove Cordova, since Capacitor works alongside it. In fact, if you plan to continue using Cordova plugins or think you may in the future, you can leave the Cordova assets where they are.

## Next Steps

This is just the beginning of your Capacitor journey. Learn more about [using Cordova plugins](/docs/cordova/using-cordova-plugins) in a Capacitor project or more details on the Capacitor [development workflow](/docs/basics/workflow).
