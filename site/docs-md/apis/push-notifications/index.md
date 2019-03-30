<plugin-platforms platforms="ios,android"></plugin-platforms>

# Push Notifications

The Push Notifications API provides methods for registering a device to receive notifications from a server, along with processing received notifications and responding to them. In contrast, the [Local Notifications](../local-notifications) API provides means for offline, local notification scheduling and processing.

## Enabling Push Notifications Capabilites

On iOS it's required to enable Push Notifications Capabilities in your project to make Push Notifications plugin work. To do so, go to the `Capabilities` section of your app and switch the `Push Notifications` button from `OFF` to `ON` possition.

That will add the push capabilites to your app and will create an entitlements file.

![Enabling Push Notifications Capabilities](/assets/img/docs/ios/enable-push-capabilities.png)

On Android just download your app's `google-services.json` file from Firebase console and put it in `projectName/android/app` folder.

## Push Notifications icon

On Android, the Push Notifications icon with the appropriate name should be added to the `AndroidManifest.xml` file:

```
<meta-data android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@mipmap/push_icon_name" />
```

If no icon is specified Android will use the application icon, but push icon should be white pixels on a transparent backdrop. As the application icon is not usually like that, it will show a white square or circle. So it's recommended to provide the separate icon for Push Notifications.

Android Studio has an icon generator you can use to create your Push Notifications icon.

## Disabling Push Notifications plugin

If you are not using Push Notifications in your project, when you submit the app to iTunes Connect, Apple will send you an email saying it has issues because of `Missing Push Notification Entitlement`. That happens because Capacitor includes the code for registering for push notifications and getting the token.

Apple sends that mail just to make sure you didn't make a mistake and forgot to enable Push Notifications Capabilities in your app, but can safely ignore it if you are not using the Push Notifications plugin.

In case you don't want to receive the mail, you can disable the Push Notifications plugin by removing `USE_PUSH` from `Active Compilation Conditions` in your project's Build Settings section.

![Disable Push Notifications](/assets/img/docs/ios/disable-push-plugin.png)

## Push notifications appearance in foreground

On iOS you can configure the way the push notifications are displayed when the app is in foreground by providing the `presentationOptions` in your `capacitor.config.json` as an Array of Strings you can combine.

Possible values are:
* `badge`: badge count on the app icon is updated (default value)
* `sound`: the devide will ring/vibrate when the push notification is received
* `alert`: the push notification is displayed in a native dialog

An empty Array can be provided if none of the previous options are desired. `pushNotificationReceived` event will still be fired with the push notification information.

```json
"plugins": {
  "PushNotifications": {
    "presentationOptions": ["badge", "sound", "alert"]
  }
}
```

<plugin-api index="true" name="push-notifications"></plugin-api>


## Example

## API

<plugin-api name="push-notifications"></plugin-api>
