# Configuring Your App

Capacitor embraces the idea of "Code once, configure everywhere": configuration is
managed per-platform instead of in an abstracted system like a `config.xml` in Cordova, for example.

This is an important point, because it means that Capacitor requires you to be more involved in the native project configuration than with Cordova, for example. However,
we think this is the right approach, because it makes it easy to follow existing Native iOS/Android guides, get help on Stack Overflow, and have full control over your project.

Additionally, because configuring a Capacitor project is no different from configuring an iOS or Android project, existing native development teams can easily work alongside
web developers, with each side using the tools and SDKs they are familiar with. Of course, we believe web developers can handle all the required Native configuration on their own, and 
the Capacitor documentation exists to help web developers do just that.

## Common Configuration

Capacitor has some high level configuration options that are set in `capacitor.config.json`. These generally don't modify native functionality, but control Capacitor's tooling.

The current ones you might configure are:

```javascript
{
  // Sets the directory of your built web assets. This is the directory that will be
  // used to run your app in a native environment
  "webDir": "public",

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
  "windowsAndroidStudioPath": 'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe',

  // Server object contains port and url configurations 
  "server": {
    // Capacitor runs a local web server, you can configure what port to use.
    // If you don't configure it, a random port will be assigned and persisted.
    "port": "8787",
    // You can make the app to load an external url (i.e. to live reload)
    "url": "http://192.168.1.33:8100"
  },
  "android": {
    // On Android, Capacitor loads your local assets using https
    // Chrome by default prevents loading files from a different scheme (i.e. from http)
    // This setting allows to mix content from different schemes
    "allowMixedContent": true,
    // Android's default keyboard doesn't allow proper JS key capture
    // You can use a simpler keyboard enabling this preference
    // Be aware that this keyboard has some problems and limitations
    "captureInput": true
  },
  "ios": {
    // Configure the Swift version to be used for Cordova plugins.
    // Default is 4.0
    "cordovaSwiftVersion": "3.2",
    // Minimum iOS version supported by the project.
    // Default is 10.0
    "minVersion": "10.3"
  }
}
```

## Native Configuration

iOS and Android each have configuration guides walking through making common changes to their behavior:

[Configuring iOS](/docs/ios/configuration)

[Configuring Android](/docs/android/configuration)