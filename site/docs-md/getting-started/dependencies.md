# Capacitor Required Dependencies

## iOS Development

For building iOS apps, Capacitor requires a Mac with Xcode 9 or above. Soon, you'll be able to use [Ionic Pro](http://ionicframework.com/pro) to build for iOS even if you're on Windows.

As a rule, the latest version of Capacitor always supports the last two iOS versions. For example, iOS 11 and iOS 10. For support for older versions of iOS, use an older version of Capacitor (if available).

## Android Development

Android development requires the Android SDK installed with [Android Studio](https://developer.android.com/studio/index.html). Technically, Android Studio isn't required as you can build and run apps using only the Android CLI tools, but it will make building and running your app much easier so we strongly recommend using it.

Android version support for Capacitor is more complex than iOS. Currently, we are targeting API level 21 or greater, meaning Android 5.0 (Lollipop) or above.

As of January 2018, 5.0 or greater represents over 75% of the Android market, and this percentage is growing quickly. By the time Capacitor is production ready, this percentage should be much higher.

## Progressive Web App Development

For building Progressive Web Apps, Capacitor currently requires a JavaScript project with module loading support. For example, using Webpack or Rollup.

This is a limitation that will be resolved soon.

## Electron Development

*Coming soon.* Electron support isn't ready just yet.