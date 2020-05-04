---
title: Configuring Your App
description: Native Project Configuration
url: /docs/basics/configuring-your-app
contributors:
  - jcesarmobile
  - dotnetkow
---

# Configuring Your App

<p class="intro">Capacitor embraces the idea of "Code once, configure everywhere": configuration is
managed per-platform instead of in an abstracted system like a <code>config.xml</code> in Cordova, for example.</p>

## Per-platform Management

Capacitor requires you to be more involved in the native project configuration than with Cordova, for example. However,
we think this is the right approach, because it makes it easy to follow existing Native iOS/Android guides, get help on Stack Overflow, and have full control over your project.

Additionally, because configuring a Capacitor project is no different from configuring an iOS or Android project, existing native development teams can easily work alongside
web developers, with each side using the tools and SDKs they are familiar with. Of course, we believe web developers can handle all the required Native configuration on their own, and 
the Capacitor documentation exists to help web developers do just that.

## Common Configuration

Capacitor has some high level configuration options that are set in `capacitor.config.json`. These generally don't modify native functionality, but control Capacitor's tooling.

The current ones you might configure are:

```json5
{
  // The package name for Android and the bundle identifier for iOS.
  "appId": "com.company.appname",

  // Your app's name.
  "appName": "Capacitor Kitchen Sink",

  // Sets the directory of your built web assets. This is the directory that will be
  // used to run your app in a native environment.
  "webDir": "www",

  // The JavaScript package manager to use, either npm or yarn.
  "npmClient": "npm",

  // Whether to use capacitor.js as a bundle that is copied to your web code,
  // or require it to be bundled/imported through a typical
  // typescript/babel/webpack/rollup workflow.
  //
  // The starter project sets this to true, but if you're using Ionic or another framework,
  // you'll probably want this to be false (default is false)
  "bundledWebRuntime": false,

  // On Windows, we aren't able to automatically open Android Studio
  // without knowing the full path. The default is set to the default
  // Android Studio install path, but you may change it manually.
  "windowsAndroidStudioPath": "C:\Program Files\Android\Android Studio\bin\studio64.exe",

  // A Boolean value that determines whether to hide native logs for iOS and Android. The preference is ignored if it's also declared inside ios or android
  // Default is false
  "hideLogs": true

  // Server object contains port and url configurations 
  "server": {
    // You can make the app to load an external url (i.e. to live reload)
    "url": "http://192.168.1.33:8100",
    // You can configure the local hostname, but it's recommended to keep localhost
    // as it allows to run web APIs that require a secure context such as
    // navigator.geolocation and MediaDevices.getUserMedia.
    "hostname": "app",
    // It is possible to configure the local scheme that is used. This can be useful
    // when migrating from cordova-plugin-ionic-webview, where the default scheme on iOS is ionic.
    "iosScheme": "ionic",
    "androidScheme": "http",
    // Normally all external URLs are opened in the browser. By setting this option, you tell
    // Capacitor to open URLs belonging to these hosts inside its WebView.
    "allowNavigation": [
      "example.org",
      "*.example.org",
      "192.0.2.1"
    ]
  },
  // User agent of Capacitor WebView for iOS, Android and Electron, unless also declared inside ios, android or electron objects
  "overrideUserAgent": "my custom user agent",
  // String to append to the original user agent of Capacitor WebView for iOS, Android and Electron,
  // unless also declared inside ios, android or electron objects. Only if overrideUserAgent is not set.
  "appendUserAgent": "string to append",
  // Background color of Capacitor WebView for both iOS and Android unless also declared inside ios or android objects
  "backgroundColor": "#ffffffff",
  "android": {
    // User agent of Capacitor WebView for Android
    "overrideUserAgent": "my custom user agent for Android",
    // String to append to the original user agent of Capacitor WebView for Android.
    "appendUserAgent": "string to append for Android",
    // Background color of Capacitor WebView for Android only
    "backgroundColor": "#ffffffff",
    // On Android, if you are loading the app from a remote/testing server from https
    // protocol, you need to enable mixed content mode to allow the WebView to load
    // files from different schemes such as capacitor-content:// or capacitor-file://
    "allowMixedContent": true,
    // Android's default keyboard doesn't allow proper JS key capture
    // You can use a simpler keyboard enabling this preference
    // Be aware that this keyboard has some problems and limitations
    "captureInput": true,
    // Enables debugging of web contents (HTML / CSS / JavaScript) loaded into
    // any WebViews of this application.
    // This flag can be enabled in order to facilitate debugging of web layouts
    // and JavaScript code running inside WebViews.
    "webContentsDebuggingEnabled": true,

    // A Boolean value that determines whether to hide native Android logs or not
    // Default is false
    "hideLogs": true
  },
  "ios": {
    // User agent of Capacitor WebView for iOS
    "overrideUserAgent": "my custom user agent for iOS",
    // String to append to the original user agent of Capacitor WebView for iOS.
    "appendUserAgent": "string to append for iOS",
    // Background color of Capacitor WebView for iOS only
    "backgroundColor": "#ffffffff",
    // Configure the WebView's UIScrollView's content inset behavior
    // Default is never
    // Possible values are "automatic", "scrollableAxes", "never" and "always"
    // https://developer.apple.com/documentation/uikit/uiscrollview/contentinsetadjustmentbehavior
    "contentInset": "always",
    // Configure the Swift version to be used for Cordova plugins.
    // Default is 5.0
    "cordovaSwiftVersion": "4.2",
    // Minimum iOS version supported by the project.
    // Default is 11.0
    "minVersion": "11.3",
    // Some Cordova plugins require to configure the linker flags
    "cordovaLinkerFlags": ["-ObjC"],
    // A Boolean value that determines whether pressing on a link displays a preview of
    // the destination for the link.
    "allowsLinkPreview": false,

    // A Boolean value that determines whether to hide native iOS logs or not
    // Default is false
    "hideLogs": true
  },
  "electron": {
    // User agent of Capacitor WebView for Electron
    "overrideUserAgent": "my custom user agent for Electron",
    // String to append to the original user agent of Capacitor WebView for Electron.
    "appendUserAgent": "string to append for Electron",
  }
}
```

## Native Configuration

iOS and Android each have configuration guides walking through making common changes to their behavior:

[Configuring iOS &#8250;](/docs/ios/configuration)

[Configuring Android &#8250;](/docs/android/configuration)
