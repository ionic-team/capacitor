# Using Push Notifications with Firebase in an Ionic Angular 4 App

Platforms: iOS, Android

One of the most common features provided by application developers to their users is push notifications. In this tutorial, we'll walk through all the steps needed to get [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) working on iOS and Android.

For the purposes of registering and monitoring for push notifications from Firebase, we'll make use of the [Push Notification API for Capacitor](https://capacitor.ionicframework.com/docs/apis/push-notifications/) in an Ionic Angular 4 application.

## Required Dependencies

Building and deploying iOS and Android applications using Capacitor requires a bit of setup. Please [follow the instructions to install the necessary Capacitor dependencies here](../getting-started/dependencies) before continuing.

To test push notifications on iOS, Apple requires that you have [a paid Apple Developer account](https://developer.apple.com/) and a *physical* iOS device.

## Prepare an Ionic 4 App
If you have an existing Ionic 4 app, skip this section. If not, let's create an Ionic app first. 

In your preferred terminal, install the latest version of the Ionic CLI:

```bash
npm install -g ionic
```

Next, let's use the CLI to create a new Ionic 4 app based on the **blank** starter project and call it **capApp**:

```bash
ionic start capApp blank
```

## Add Capacitor

Once the application has been created successfully, switch to the newly created project directory. For example, on a Mac:

```bash
cd capApp/
```

Next, let's add Capacitor and the Capacitor CLI to our new application...

```bash
ionic integrations enable capacitor
```

... and finish up by running `npx cap init`, which will allow us to fill out our app information.

```bash
npx cap init
? App name: CapApp
? App Package ID: com.mydomain.myappname
```

## Building the App & Adding Platforms
Before adding any native platforms to this project, the app must be built at least once. A web build creates the web assets directory that Capacitor needs (`www` folder in Ionic projects).

```bash
ionic build
```

Next, let's add the iOS and Android platforms to our app.

```bash
npx cap add ios
npx cap add android
```

Upon running these commands, both `android` and `ios` folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your Ionic app (i.e., check them into source control).

## Using the Capacitor Push Notification API

Before we get to Firebase, we'll need to ensure that our application can register for push notifications by making use of the Capacitor Push Notification API. We'll also add an `alert` (you could use `console.log` statements instead) to show us the payload for a notification when it arrives and the app is open on our device.

In your app, head to the `home.page.ts` file and add an `import` statement and a `const` to make use of the Capacitor Push API:

```typescript
import {
  Plugins,
  PushNotification,
  PushNotificationToken } from '@capacitor/core';

const { PushNotifications } = Plugins;
```

Then, update the `ngOnInit()` method to register for push and `console.log()` a few of the events to listen for related events. My setup uses the `registration` / `registrationError` and `pushNotificationReceived` events:

```typescript
export class HomePage implements OnInit {

ngOnInit() {
    console.log('Initializing HomePage');

    // Register with Apple / Google to receive push via APNS/FCM
    PushNotifications.register();

    // On succcess, we should be able to receive notifications
    PushNotifications.addListener('registration', 
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', 
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotification) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );
}
```

Here is the full implementation of `home.page.ts`:

```typescript
import { Component, OnInit } from '@angular/core';

import {
  Plugins,
  PushNotification,
  PushNotificationToken } from '@capacitor/core';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  ngOnInit() {
    console.log('Initializing HomePage');

    PushNotifications.register();

    PushNotifications.addListener('registration', 
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
      }
    );

    PushNotifications.addListener('registrationError', 
      (error: any) => {
        alert('Error on registration: ' + JSON.stringify(error));
      }
    );

    PushNotifications.addListener('pushNotificationReceived', 
      (notification: PushNotification) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );
}
```

## Creating a Project for your App on Firebase

Before we can connect Firebase Cloud Messaging to your application and send push notifications, you'll need to start a project in Firebase.

Go to the [Firebase Console](https://console.firebase.google.com/) and click the **Add project** button.

Name the project, accept the Firebase ToS and click **Create project** to continue. A Project ID should be automatically generated for you.

## Android

### Integrating Firebase with the Android app

This section more-or-less mirrors the [setting up Firebase using the Firebase console documentation](https://firebase.google.com/docs/android/setup?authuser=0). See below for specific Capacitor-related notes.

Go to the Project Overview page for your Firebase project and, under the **Grow** section, click the **Cloud Messaging** option. At the top, click on the **Android** icon.

The next screen will ask you for some information about your application.

- Your **Android package name** should match the **appId** from your `capacitor.config.json` file
- We used `com.mydomain.myappname` for this Capacitor app ID, so that is what we'll use for this entry.
- Nickname and Debug Signing Certificate are optional

Then click the **Register app** button.

### Download and Use the `google-services.json` file

The next prompt will ask you to download a `google-services.json` file. This file contains the information your Capacitor app needs to connect to Firebase from Android.

Download the `google-services.json` file to your local machine. Then move the file into your Capacitor Android project directory, specifically under `android/app/`.

![Google Services JSON Location for Android](/assets/img/docs/guides/firebase-push-notifications/google-services-location-android.png)

We don't need to *add* any permissions to our project because Capacitor projects automatically include a version of `firebase-messaging` in our `app/build.gradle` file:

```
implementation 'com.google.firebase:firebase-messaging:17.4.0'
```

**Note**: Make sure that the file is added to source control. You may need to modify the `.gitignore` file under `android/` to add the file.

## iOS

### Prerequisites

iOS push notifications are significantly more complicated to set up than Android. You must have a [paid Apple Developer account](https://developer.apple.com/) *and* take care of the following items prior to being able to test push notifications with your iOS application:

1. [Setup the proper Development or Production certificates & provisioning profiles](https://help.apple.com/xcode/mac/current/#/dev60b6fbbc7) for your iOS application in the Apple Developer Portal
2. [Create an APNS certificate or key](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/establishing_a_certificate-based_connection_to_apns) for either Development or Production in the Apple Developer Portal
3. [Ensure Push Notification capabilities have been enabled](https://help.apple.com/xcode/mac/current/#/dev88ff319e7) in your application in Xcode
4. Have a physical iOS device running one of the two latest iOS versions (push notification functionality does not work in the iOS simulators)

### Integrating Firebase with our native iOS app

This part is very similar to the Android section above, with a few key differences.

First, go to the **Project Overview** page for your Firebase project. If you've been following this guide, you'll already have an Android application listed at the top of the page.

To add iOS to your Firebase project, click the **Add App** button and select the **iOS** platform.

The next screen will ask you for some information about your application.

- Your **iOS bundle ID** should match the **appId** from your `capacitor.config.json` file
- We used `com.mydomain.myappname` for this Capacitor app ID, so that is what we'll use for this entry.
- App Nickname and App Store ID are optional

Then click the **Register app** button.

### Add the `GoogleService-Info.plist` file to your iOS app

**Note**: This is **not** the same file used for your Android app.

Download the `GoogleService-Info.plist` provided to your local machine and move it into your Xcode project as instructed, ensuring to add it to all targets. 

![Google Service Info Plist Location for iOS](/assets/img/docs/guides/firebase-push-notifications/google-plist-location-ios.png)

**Note**: It is recommended to use Xcode to move the `.plist` file into your project.

### Add the Firebase SDK via CocoaPods

The Push Notification API on iOS makes use of CocoaPods - an iOS dependencies management system - and we need to tell CocoaPods to make use of Firebase.

To do this, we need to modify the `Podfile`, which is located in your `ios/App` directory:

![Podfile Location iOS](/assets/img/docs/guides/firebase-push-notifications/podfile-location-ios.png)

We need to modify the App target pods to include Firebase. To do that, add `pod Firebase/Messaging` to your `target 'App'` section, like so:

```ruby
import Capacitor
import Firebase # Add this line

...

target 'App' do
capacitor_pods
# Add your Pods here
pod 'Firebase/Messaging' # Add this line
end
```

Your `Podfile` should look something like this:

```ruby
platform :ios, '11.0'
use_frameworks!

# workaround to avoid Xcode 10 caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  # Automatic Capacitor Pod dependencies, do not delete
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  
  # Do not delete
end

target 'App' do
  capacitor_pods
  # Add your Pods here
  pod 'Firebase/Messaging'
end
```

### Add Initialization Code

To connect to Firebase when your iOS app starts up, you need to add the following initialization code to your `AppDelegate.swift` file, in the `application(didFinishLaunchingWithOptions)` method:

```swift
FirebaseApp.configure()
```

Your `AppDelegate.swift` file's `application(didFinishLaunching)` method should look something like this:

```swift
var window: UIWindow?

func application(_ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
  FirebaseApp.configure()
  return true
}
```

### Update the Project

Now we'll need to ensure that our iOS project is updated with the proper Firebase CocoaPod installed.

*Note*: This part can take awhile as CocoaPods needs to download all the appropriate files/dependencies.

```bash
npx cap update ios
```

### Upload the APNS Certificate or Key to Firebase

If you followed the instructions from the beginning, you'll have created an Apple APNS Certificate or an APNS Auth Key in the Apple Developer portal. You need to upload one of these to Firebase before Firebase can talk to APNS and send push notifications to your application.

To upload your certificate or auth key, from the **Project Overview** page:

1. Click on your iOS application and then the **Settings** gear icon.
2. On the Settings page, click on the **Cloud Messaging** tab.
3. Under the **iOS app configuration** header, upload your Auth Key or Certificate(s) using the provided **Upload** button.

## Sending a Test Notification

Now for the fun part - let's verify that push notifications from Firebase are working on Android and iOS!

We need to fire up our application on Android or iOS to see our code on `home.page.ts` receive the notifications.

To open your Android project in Android Studio:
```bash
npx cap open android
```

To open your iOS project in Xcode:
```bash
npx cap open ios
```

Once the project is open, side-load the application on your device using the Run feature of either Android Studio or Xcode. The app should start up on the home page.

**Note**: You may be asked to allow the application to receive notifications if this is the first time starting it up (this is the Push Notification API registering with Apple / Google). Make sure you choose to **Allow notifications**, or the next step won't work!

Now we'll test to see if the notifications are received by our device. To send a notification, in Firebase, go to the **Cloud Messaging** section under the Grow header in the project pane. 

Next, select the **New Notification** button. 

When creating the notification, you only need to specify the following information:

1. The text of the notification
2. The title (Android only, optional for iOS)
3. The Target (either a user segment or topic; I recommend just targeting the iOS or Android app itself, see below)

![Change Push Target Firebase](/assets/img/docs/guides/firebase-push-notifications/change-push-target-firebase.png)

4. The Scheduling (leave this to "Now")

At that point, you can **Review** the notification you've put together and select **Publish** to send the notification out.

If you've setup your application correctly, you'll see an alert pop up on your home screen with the push notification you composed in Firebase!

![Push Test Android](/assets/img/docs/guides/firebase-push-notifications/push-test-android.png)

![Push Test iOS](/assets/img/docs/guides/firebase-push-notifications/push-test-ios.png)
