---
title: Deep Links
description: Implement deep linking functionality in an iOS and Android app
url: /docs/guides/deep-links
contributors:
  - dotnetkow
---

# Deep Linking with Universal and App Links

**Platforms**: iOS, Android

Universal links (iOS) and App Links (Android) offer the ability to take users directly to specific content within a native app (commonly known as deep linking).

When users tap or click on a deep link, the user is sent directly into your app without routing through the device's web browser or website first. If the app isn't installed, then the user is directed to the website. If the user navigates directly to the website, they remain on the website.  This makes deep links an excellent feature for cross-platform apps built for the web, iOS, and Android: a seamless mobile experience, with graceful fallback to the website.

Benefits:
- Secure: Universal/App Links use HTTPS URLs that link to a website domain that you own, ensuring that no other app can use your links.
- Seamless experience: One URL works for both your website and app, ensuring that users can successfully access the content they're looking for without errors.
- Increase Engagement: Links can be opened from email clients, search engine results, and more.

## Demo Video

Here's what it looks like in practice. In this example, the user has the native app installed. They tap on app links from an email and are brought directly into the app itself. First, the root link is tapped (https://beerswift.app), which directs the user to the main app page. Next, a deep link is tapped (https://beerswift.app/tabs/tab3) bringing the user to the Tab3 page.

<iframe width="560" height="315" src="https://www.youtube.com/embed/vadlZ-d8wAI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Prerequisites

* A pre-configured [Capacitor app](/docs/getting-started).
* For iOS, enrollment in the Apple Developer Program.

For illustrative purposes, https://beerswift.app will be used as the web app link.

## Deep Link Routing using the Capacitor App API

When the native app is opened after a deep link is clicked, the mobile OS doesn't automatically know where to route the user. This must be implemented within the app itself using the Capacitor [App API](../apis/app) on app startup.

If your website and app paths don't match, you will need to implement more advanced url pattern matching (see [this guide](https://devdactic.com/universal-links-ionic/) for examples). If your mobile app and web app use the same codebase though, this is very straightforward - just redirect to the same URL. The following examples assume this.

### Angular

Routing should be implemented in `app.component.ts`. Start by importing `NgZone` and `Router` from Angular, then `App` from Capacitor:

```typescript
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
const { App } = Plugins;
```

Next, add `Router` and `NgZone` to the constructor:

```typescript
constructor(private router: Router, private zone: NgZone) {
    this.initializeApp();
}
```

Last, listen for the `appUrlOpen` event, and redirect when a deep link is found:

```typescript
initializeApp() {
    App.addListener('appUrlOpen', (data: any) => {
        this.zone.run(() => {
            // Example url: https://beerswift.app/tabs/tab2
            // slug = /tabs/tab2
            const slug = data.url.split(".app").pop();
            if (slug) {
                this.router.navigateByUrl(slug);
            }
            // If no match, do nothing - let regular routing 
            // logic take over
        });
    });
}
```

### React

There's a variety of options for React. One approach is to wrap the App API listener functionality in a new component, then add it inside of `App.tsx`. Start by creating `AppUrlListener.tsx` then import the React Router `useHistory` hook as well as the Capacitor App API:

```typescript
import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { Plugins } from '@capacitor/core';
const { App: CapApp } = Plugins;
```

Next, define the AppUrlListener component, listening for the `appUrlOpen` event then redirecting when a deep link is found:

```typescript
const AppUrlListener: React.FC<any> = () => {
    let history = useHistory();
    useEffect(() => {
        CapApp.addListener('appUrlOpen', (data: any) => {
            // Example url: https://beerswift.app/tabs/tab2
            // slug = /tabs/tab2
            const slug = data.url.split(".app").pop();
            if (slug) {
                history.push(slug);
            }
            // If no match, do nothing - let regular routing 
            // logic take over
        });
    }, []);

    return null;
};

export default AppUrlListener;
```

Over in `App.tsx`, import the new component:

```typescript
import AppUrlListener from './pages/AppUrlListener';
```

Then add it inside of `IonReactRouter` (or wherever your app is bootstrapped, just ensure that the History hook is available):

```tsx
const App: React.FC = () => {
    return (
        <IonApp>
            <IonReactRouter>
                <AppUrlListener></AppUrlListener>
                <IonRouterOutlet>
                    <Route path="/home" component={Home} exact={true} />
                    <Route exact path="/" render={() => <Redirect to="/home" />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </IonApp>
    );
};
```

## Creating Site Association Files

In order for Apple and Google to permit deep links to open your app, a two-way association between your website and app must be created. One file for each must be created and placed within a `.well-known` folder on your website, like so: https://beerswift.app/.well-known/.

Continue on for iOS and Android configuration details.

## iOS Configuration

iOS configuration involves creating a site association file and configuring the native app to recognize the app domain.

> You must be enrolled in the Apple Developer Program.

### Create Site Association File

First, log into the [Apple Developer site](https://developer.apple.com). Navigate to the "Certificates, Identifiers, & Profiles" section and select your app's identifier. Note the Team ID and Bundle ID, and under Capabilities, toggle "Associated Domains" then save:

![iOS Identifier Config](/assets/img/docs/guides/deep-links/ios-config.png)

Next, create the site association file (`apple-app-site-association`).

> Note: Despite being a JSON file, do not save it with a file extension.

```json
// apple-app-site-association
{
    "applinks": {
        "apps": [],
        "details": [
            {
                // example: 8L65AZE66A.com.netkosoft.beerswift
                "appID": "TEAMID.BUNDLEID",
                "paths": ["*"]
            }
        ]
    }
}
```

Next, upload the file to your web site (hosted on HTTPS), then validate that it's configured correctly using Apple's tool [here](https://search.developer.apple.com/appsearch-validation-tool/). The URL should follow this format: https://beerswift.app/.well-known/apple-app-site-association

### Add Associated Domain

The final step is to configure the iOS app to recognize incoming links. Open Xcode, then navigate to Signing & Capabilities. Click "+ Capability", then choose Associated Domains. In the Domains entry that appears, edit it using the format `applinks:yourdomain.com`:

![Xcode Associated Domain](/assets/img/docs/guides/deep-links/xcode-associated-domain.png)

## Android Configuration

Android configuration involves creating a site association file and configuring the native app to recognize app links using an intent filter.

### Create Site Association File

The Site Association file requires the SHA256 fingerprint of your Android certificate.

If you don’t have one, create a certificate:

```shell
keytool -genkey -v -keystore KEY-NAME.keystore -alias ALIAS -keyalg RSA -keysize 2048 -validity 10000
```

Using your existing (or newly created) Keystore certificate, use the keytool command to list the keystore's details:

```shell
keytool -list -v -keystore my-release-key.keystore
```

The printed output will include the SHA256 fingerprint:

![Keytool output](/assets/img/docs/guides/deep-links/keystore-sha256.png)

Next, use Google's [Asset Links tool](https://developers.google.com/digital-asset-links/tools/generator) to create the Site Association file. Fill in the website domain, app package name, and SHA256 fingerprint, then click "Generate statement":

![Android Identifier Config](/assets/img/docs/guides/deep-links/android-config.png)

Copy the JSON output into a new local file under `.well-known/assetlinks.json`.

```json
// assetlinks.json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.netkosoft.beerswift",
      "sha256_cert_fingerprints": [
        "43:12:D4:27:D7:C4:14..."
      ]
    }
  }
]
```

Deploy the file to your website (hosted on HTTPS), then verify it by clicking the "Test statement" button in the Asset Link tool. If it's configured correctly, a Success message will appear:

> Success! Host [website] grants app deep linking to [app package].

### Add Intent Filter

The final step is to configure the Android app to recognize incoming links. To do so, [add a new Intent Filter](https://developer.android.com/training/app-links/deep-linking#adding-filters) to `AndroidManifest.xml` within the `<activity>` element:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="beerswift.app" />
</intent-filter>
```

The complete Activity should look similar to this:

```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
    android:name="com.netkosoft.beerswift.MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask">

    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="beerswift.app" />
    </intent-filter>
</activity>
```

## Details: Website Configuration

Website configuration will vary based on the tools and backend used. A few suggestions are below.

### Angular

Place the association files under `src/.well-known`. Next, configure the build process to deploy these files exactly as-is (ensuring that Apple/Google can read them correctly). Open `angular.json` and under `architect => assets`, add a new entry to the array:

```json
{
    "glob": "**/*",
    "input": "src/.well-known",
    "output": ".well-known/"
}
```

Build then deploy the site.

### React

Place the association files under `public/.well-known`. No additional steps are necessary; simply build then deploy the site.

### Wordpress

See [here](https://devdactic.com/universal-links-ionic/) for Wordpress instructions.


## Verification

To verify that the websites and the native apps are configured correctly, the website needs to host the Site Association files but the apps do not need to be in the app stores.

Connect a device to your computer, build and deploy the native apps, then test by tapping on website links. If the native app opens, all steps have been implemented correctly.

## Resources

* Branch.io: [What is Deep Linking?](https://branch.io/what-is-deep-linking/)
* Android: [App Links](https://developer.android.com/training/app-links)
* iOS: [Universal Links](https://developer.apple.com/documentation/uikit/inter-process_communication/allowing_apps_and_websites_to_link_to_your_content)
* iOS: [Enabling Universal Links](https://developer.apple.com/documentation/uikit/inter-process_communication/allowing_apps_and_websites_to_link_to_your_content/enabling_universal_links)
