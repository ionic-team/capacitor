---
title: Capacitor APIs
description: Capacitor APIs
url: /docs/apis
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor APIs

Capacitor includes a number of Native APIs that are available to all Capacitor apps. These can be thought of as Capacitor "core plugins," and they make it easy to access commonly needed functionality on each platform.

For those coming from Cordova, the core Capacitor APIs cover much of the core Cordova plugins, and also include some new ones.

See the APIs list on the left menu for the full list of available APIs.

## API Usage

To use a Capacitor API, follow these steps:

1) Import the API:
```typescript
import { Browser } from '@capacitor/core';
```

2) Extract the API object from `Plugins`:
```typescript
const { Browser } = Plugins;
```

3) Use the API:
```typescript
async openBrowser() {
  // On iOS, for example, open the URL in SFSafariViewController (the in-app browser)
  await Browser.open({ url: "https://ionicframework.com" });
}
```

A common mistake is to import an API then reference it immediately, resulting in the web implementation being used:
```typescript
import { Browser } from '@capacitor/core';

async openBrowser() {
  // On iOS, for example, this will open the URL in Safari instead of 
  // the SFSafariViewController (in-app browser)
  await Browser.open({ url: "https://ionicframework.com" });
}
```

By instead leveraging the API object, the native implementation of the API is used first, followed by the web version (if available).
