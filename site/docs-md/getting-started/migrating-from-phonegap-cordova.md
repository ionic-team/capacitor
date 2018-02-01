# Migrating from Cordova/PhoneGap to Capacitor

Capacitor can be used as a replacement for Cordova/PhoneGap in many cases. The two projects provide a web environment with full access to native features and functionality, but with a few differences in their approach to tooling, native project management, and plugins. Capacitor also has support for existing Cordova plugins, providing a new runtime with access to the rich Cordova plugin ecosystem.

## Differences between Capacitor and Cordova

Capacitor has a few differences in approach that require changing app development workflows.

### Native Project Management

First, Capacitor considers each platform project a _source asset_ instead of a build time asset. That means you'll check in your Xcode and Android Studio projects, as well as use those IDEs when necessary for platform-specific configuration and running/testing.

We do this for a few reasons:

 1. It's easier to add custom native code that your app might need, without having to build a plugin for it
 2. Updating and modifying native projects through abstracted-away tools is error prone and a moving target
 3. Adding Native UI shell around your web app is easier when you "own" the project
 4. Running iOS apps from the command line is not officially supported by Apple, so Xcode is preferred

This change in approach has a few implications. First, Capacitor does not use `config.xml` or a similar custom configuration for platform settings; all configuration is done by editing the appropriate platform-specific configuration files directly, such as `AndroidManifest.xml` for Android, and `Info.plist` for Xcode.

Capacitor does not run on device or emulate through the command line. Instead, such operations are done through the platform-specific IDE which we believe provides a faster, more typical experience that follows the standards of app development for that platform.

### Plugin Management

Capacitor manages plugins in a different way than Cordova. First, Capacitor does not copy plugin source code to your app before building. Instead, all plugins are built as Frameworks (on iOS) and Libraries (on Android) and installed using the leading dependency management tool for each platform (CocoaPods and Gradle/Maven, respectively). Additionally, Capacitor does not modify native source code, so any necessary native project settings must be added manually (for example, permissions in `AndroidManifest.xml`). We think this approach is less error-prone, and makes it easier for developers to find help in the community for each specific platform.

One major difference is the way Plugins handle the JavaScript code they need in order to be executed from the WebView. Cordova requires plugins to ship their own JavaScript and manually call `exec()`. Capacitor, in contrast, registers and exports all JavaScript for each plugin based on the methods it detects at runtime, so all plugin methods are available as soon as the WebView loads. One important implication of this is there is no more need for the `deviceready` event: as soon as your app code loads you can start calling Plugin methods.

While Capacitor doesn't require plugins to provide JavaScript, many plugins will want to have logic in JavaScript. In this case, providing a plugin with extra JavaScript is as easy as shipping a traditional JavaScript library (bundle, module, etc), but instead of calling `exec()` in Cordova, the plugin will reference the Capacitor plugin through `Capacitor.Plugins.MyPlugin`.

Finally, Capacitor has implications for plugin authors. On iOS, Swift 4 is officially supported and even _preferred_ for building plugins (Objective-c is also supported). Plugins no longer export a `Plugin.xml` file; Capacitor provides a few simple macros (on iOS), and Annotations (on Android) for adding metadata to your plugin source code that Capacitor reads at runtime.

### CLI/Version Management

Capacitor, unlike Cordova, does not use a global CLI. Instead, the Capacitor "CLI" is installed locally to each project as an npm script. This makes it easier to manage versions of Capacitor across many different apps.

Thus, instead of running `capacitor` directly from the command line, Capacitor is invoked by calling `npx capacitor` in the directory of your app.

## Migration Process

## Using Cordova Plugins in Capacitor

Capacitor was designed from the start to support the rich Cordova plugin ecosystem out of the box. Thus, using Cordova plugins in Capacitor is easy. Follow the [Cordova Plugin]() guide for more information on how this works.