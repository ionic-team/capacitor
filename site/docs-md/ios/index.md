# Capacitor iOS Documentation

Capacitor features a native iOS bridge that enables developers to communicate between JavaScript and Native Swift or Objective-C code.

Capacitor iOS apps are configured and managed through Xcode, with dependencies managed by CocoaPods.

## Getting Started

Building iOS apps requires some iOS development dependencies to be installed, including Xcode 9 and the Xcode command line tools.

Note: It's possible to develop and build iOS apps without a mac, such as by using Ionic Pro's Package service. Consult your service of choice for more information.

### Creating iOS App

By default, an iOS project is created for every Capacitor project. If you are adding Capacitor to an existing
project, you can manually add the iOS project using

```bash
npx capacitor add ios
npx capacitor sync
```

The `sync` command updates dependencies, and copies any web assets to your project. You can also run

```bash
npx capacitor copy
```

To copy web assets only, which is faster if you know you don't need to update native dependencies.

### Opening iOS Project

To open the project in Xcode, run

```bash
npx capacitor open ios
```

### Running Your App

Once Xcode is open, just click the Play button to run your app on a Simulator or Device. 

![Running your app](/assets/img/docs/ios/running.png)

## Next steps

If your app ran you are now ready to continue developing and building your app. Use the various APIs available, Capacitor or Cordova plugins, or custom native code to build our the rest of your app.

## Further Reading 

Follow these guides for more information on each topic:

[Configuring and setting permissions for iOS](./configuration)

[Building Native Plugins for iOS](../plugins)
