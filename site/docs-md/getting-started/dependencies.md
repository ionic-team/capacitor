# Capacitor Required Dependencies

Capacitor has a number of dependencies depending on which platforms you're targeting and which operating systems you are developing on.

The base requirements are **[Node v8.6.0](https://nodejs.org) or later**, and **NPM version 5.6.0 or later** (which is usually automatically installed with the required version of Node).

Capacitor *does not* officially support yarn nor will we be able to fix or keep open any issues filed for it.

For specific platforms, follow each guide below to ensure you have the correct dependencies installed.

## iOS Development

For building iOS apps, Capacitor requires a **Mac with Xcode 9 or above**. Soon, you'll be able to use [Ionic Pro](http://ionicframework.com/pro) to build for iOS even if you're on Windows.

Additionally, you'll need to install **[CocoaPods](https://cocoapods.org/)** (`sudo gem install cocoapods`), and install the **Xcode Command Line tools** (either from Xcode, or running `xcode-select --install`).

Once you have CocoaPods installed, update your local repo by running `pod repo update`. You should run this command periodically to ensure you have the latest versions of CocoaPods dependencies.

As a rule, the latest version of Capacitor always supports the last two iOS versions. For example, iOS 11 and iOS 10. For support for older versions of iOS, use an older version of Capacitor (if available).

## Android Development

First, the **Java 8 JDK** must be installed and [set to the default](https://stackoverflow.com/a/24657630/32140) if you have other versions of the JDK installed. Java 9 does _not_ work at the moment.

Android development requires the **Android SDK** installed with **[Android Studio](https://developer.android.com/studio/index.html)**. Technically, Android Studio isn't required as you can build and run apps using only the Android CLI tools, but it will make building and running your app much easier so we strongly recommend using it.

Android version support for Capacitor is more complex than iOS. Currently, we are targeting API level 21 or greater, meaning Android 5.0 (Lollipop) or above.  
As of January 2018, 5.0 or greater represents over 75% of the Android market, and this percentage is growing quickly. By the time Capacitor is production ready, this percentage should be much higher.

Also, Capacitor requires an Android WebView with Chrome version 50 or later.

## Electron Development

No specific dependencies are needed to use Capacitor with Electron