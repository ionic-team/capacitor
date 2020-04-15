---
title: Configuring iOS
description: Configuring iOS
url: /docs/ios/configuration
contributors:
  - dotnetkow
  - mlynch
---

# Configuring iOS

## Configuring `Info.plist`

iOS developers should get used to working with the `Info.plist` file, the main configuration file for their app. This file will be updated frequently with new settings that a Capacitor Plugin might require, additional configuration for your app, and for permissions your app will ask for.

In general, the easiest way to modify this file is to open your project in Xcode (`npx cap open ios`), and edit the file in Xcode's property list editor. Each settings in `Info.plist` has a low-level parameter name, and a high level name. By default, the property list editor shows the high level names, but it's often useful to switch to showing the raw, low level names. To do this, right click anywhere in the property list editor and toggle "Show Raw Keys/Values."

Underneath the hood, `Info.plist` is actually a plain XML file and can be edited directly if you desire. In this case, make sure to use the low-level parameter name for the XML `<key>` values in `Info.plist`.

Some plugins and SDKs will show settings using the low-level key, and others will use the high level key. Get used to mapping between them.

This list of [Cocoa Keys](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html) shows many possible configuration options that can be set in `Info.plist`.

## Managing Permissions

Unlike Android, permissions for iOS do not have to be specified in advance. Instead, they are prompted for when using a certain Plugin or SDK.

However, many iOS permissions require what are known as "Usage Descriptions" defined in `Info.plist`. These settings are human-readable descriptions of each permission the app will ask for.

Consult the [Cocoa Keys](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html) list for keys containing `UsageDescription` to see the various usage description settings that may be required for your app.

For more information, Apple has provided a guide to [Resolving the Privacy-Sensitive Data App Rejection](https://developer.apple.com/library/content/qa/qa1937/_index.html) which contains more information on APIs that require usage descriptions.

## Setting Entitlements

Entitlements are used to enable key features that your app may need.

Unlike certain configuration options or usage descriptions, entitlements are configured in a special area inside of Xcode, rather than in `Info.plist`.

If a plugin requires certain entitlements, open your app in Xcode, click on the name of your project in the left project menu, and select `Capabilities` in the tab bar.

## Renaming the application's default `App` name

You can't rename the App folder, but you can set the name of your app by renaming the "target" called "App".

In XCode you will see something like this:
```
PROJECT
  App
-------
TARGET
  App
```
Here you can click on the name "App" under TARGET to rename your app.

You then also have to modify the Podfile to rename the current target accordingly:

The default Podfile has an `'App'` target, which needs to be replaced by your new name here:
https://github.com/ionic-team/capacitor/blob/master/ios-template/App/Podfile#L16
