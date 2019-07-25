---
title: Browser
description: Browser API
url: /docs/apis/browser 
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Browser

<plugin-api name="browser" index="true"></plugin-api>

The Browser API makes it easy to open an in-app browser session to show external web content,
handle authentication flows, and more.

On iOS this uses `SFSafariViewController` and is compliant with leading oAuth service in-app-browser requirements.

```typescript
import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;

await Browser.open({ url: 'http://capacitor.ionicframework.com/' });
```

## Note about `browserPageLoaded`

In constrast to Cordova's `InAppBrowserEvent`, the `info` object does not contain a URL. You must use the [App](https://capacitor.ionicframework.com/docs/apis/app/) plugin's `appUrlOpen` to get the URL when the user navigates, or DOM events when in the browser to listen for a page load.

## API

<plugin-api name="browser"></plugin-api>
