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

1) Import the `Plugins` object. It represents the registry of all Capacitor plugins.
```typescript
import { Plugins } from '@capacitor/core';
```

2) Get a plugin from the Plugin Registry (`Plugins` object).
```typescript
const { Browser } = Plugins;
```

3) Use the plugin API:
```typescript
async openBrowser() {
  // On iOS, for example, open the URL in SFSafariViewController (the in-app browser)
  await Browser.open({ url: "https://ionicframework.com" });
}
```

A common mistake is to import a plugin directly, then use the plugin API immediately, resulting in the web implementation being used:
```typescript
import { Browser } from '@capacitor/core';

async openBrowser() {
  // On iOS, for example, this will open the URL in Safari instead of 
  // the SFSafariViewController (in-app browser)
  await Browser.open({ url: "https://ionicframework.com" });
}
```

By using the plugins from the plugin registry (`Plugins` object), the native implementation of the plugin is used (if available), with fallback to the web version.
