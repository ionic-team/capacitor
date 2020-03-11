---
title: Universal and App Links
description: Implement deep linking functionality in an iOS and Android app
url: /docs/guides/universal-and-app-links
contributors:
  - dotnetkow
---

# Universal and App Links

**Platforms**: Web, iOS, Android

Universal links (iOS) and App Links (Android) offer the ability to take users directly to specific content within a native app (aka deep linking).

When users tap or click on a deep link, the mobile operating system sends the user directly into your app without routing through the device's web browser or website first. If the app isn't installed, then the user is directed to the website.

Benefits:
- Secure: Universal/App Links use HTTPS URLs that link to a website domain that you own, ensuring that no other app can use your links.
- Seamless experience: One URL works for both your website and app, ensuring that users can successfully access the content they're looking for without errors.
- Increase Engagement: Links can be opened from email clients, search engine results, and more.

Here's what it looks like in practice: 

video

## Prerequisites

* A pre-configured [Capacitor app](/docs/getting-started).
* For iOS, enrollment in the Apple Developer Program.

For illustrative purposes, https://ionic.app will be used as the web app.

## Deep Link Routing using the Capacitor App API

When the native app is opened after a deep link is clicked, the mobile OS doesn't automatically know where to direct the user. This must be implemented within the app itself.

If your website and app paths don't match, you will need to implement more advanced url pattern matching (see [this guide](https://devdactic.com/universal-links-ionic/) for examples). If your mobile app and web app use the same codebase though, this is very straightforward - just redirect to the same URL directly.

Implement deep link routing by using the Capacitor [App API](../apis/app) on app startup.

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
            // Example url: https://ionic.app/tabs/tab2
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

Routing should be implemented in TODO.

## Creating Site Association Files

In order for Apple and Google to permit deep links to open your app, a two-way association between your website and app must be created. One file for each must be created and placed within a `.well-known` folder on your website, like so: https://ionic.app/.well-known/.

See iOS and Android configuration for details.

## iOS Configuration

> You must be enrolled in the Apple Developer Program.

First, log into the [Apple Developer site](https://developer.apple.com). Navigate to the "Certificates, Identifiers, & Profiles" section and select your app's identifier. Note the Team ID and Bundle ID, and under Capabilities, toggle Associated Domains then save:

![iOS Identifier Config](/assets/img/docs/guides/universal-app-links/ios-config.png)

Next, create the site association file. 

```json
{
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "TEAMID.BUNDLEID",
                "paths": ["*"]
            }
        ]
    }
}
```

> Note: Serving the file with content type `application/pkcs7-mime` is not needed. If your app runs in iOS 9 or later and you use HTTPS to serve the `apple-app-site-association` file, you can create a plain text file that uses the `application/json` MIME type.

Validate it here: https://branch.io/resources/aasa-validator/


In Xcode, under Signing & Capabilities, Add the Associated Domains.
In the Domains entry that appears, edit it: applinks:yourdomain.com

## Android Setup




## Special Configuration Details

Website configuration will vary based on the tools its built in. If the website is an Angular or React app, suggestions are below (see [here](https://devdactic.com/universal-links-ionic/) for Wordpress).

### Angular websites

Place the association files under `src/.well-known`. Next, configure the build process to deploy these files exactly as-is (ensuring that Apple/Google can read them correctly). Open `angular.json` and under `architect => assets`, add a new entry to the array:

```json
{
    "glob": "**/*",
    "input": "src/.well-known",
    "output": ".well-known/"
}
```

### React websites

TODO



## Resources

