# Configuring iOS

## Configuring Info.plist

iOS developers should get used to working with the `Info.plist` file, the main configuration file for their app. This file will be updated frequently with new settings that a Capacitor Plugin might require, additional configuration for your app, and for permissions your app will ask for.

In general, the easiest way to modify this file is to open your project in Xcode (`npm run capacitor open ios`), and edit the file in Xcode's property list editor. Each settings in Info.plist has a low-level parameter name, and a high level name. By default, the property list editor shows the high level names, but it's often useful to switch to showing the raw, low level names. To do this, right click anywhere in the property list editor and toggle "Show Raw Keys/Values."

Underneath the hood, Info.plist is actually a plain XML file and can be edited directly if you desire. In this case, make sure to use the low-level parameter name for the XML `<key>` values in Info.plist.

Some plugins and SDKs will show settings using the low-level key, and others will use the high level key. Get used to mapping between them.

This list of [Cocoa Keys](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html) shows many possible configuration options that can be set in Info.plist.

## Managing Permissions

Unlike Android, permissions for iOS do not have to be specified in advance. Instead, they are prompted for when using a certain Plugin or SDK.

However, many iOS permissions require what are known as "usage descriptions" defined in `Info.plist`. These settings are human-readable descriptions of each permission the app will ask for.

Consult the [Cocoa Keys](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html) list for keys containing `UsageDescription` to see the various usage description settings that may be required for your app.

For more information, Apple has provided a guide to [managing Sensitive Data App Rejections](https://developer.apple.com/library/content/qa/qa1937/_index.html) which contains more information on APIs that require usage descriptions.