---
title: App
description: App API
url: /docs/apis/app
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# App

The App API handles high level App state and events.

For example, this API emits events when the app enters and leaves the foreground, handles
deeplinks, opens other apps, and manages persisted plugin state.

<plugin-api index="true" name="app"></plugin-api>

## Note about `canOpenUrl`

To use `canOpenUrl`, you need to set the URL schemes your app will query for in `LSApplicationQueriesSchemes` in `Info.plist`.

Read more about [LSApplicationQueriesSchemes](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW14) and [configuring Info.plist](../ios/configuration).

## Example

```typescript
import { Plugins, AppState } from '@capacitor/core';

const { App } = Plugins;

App.addListener('appStateChange', (state: AppState) => {
  // state.isActive contains the active state
  console.log('App state changed. Is active?', state.isActive);
});

// Listen for serious plugin errors
App.addListener('pluginError', (info: any) => {
  console.error('There was a serious error with a plugin', err, info);
});

var ret = await App.canOpenUrl({ url: 'com.getcapacitor.myapp' });
console.log('Can open url: ', ret.value);

ret = await App.openUrl({ url: 'com.getcapacitor.myapp://page?id=ionicframework' });
console.log('Open url response: ', ret);

ret = await App.getLaunchUrl();
if(ret && ret.url) {
  console.log('App opened with URL: ' + ret.url);
}
console.log('Launch url: ', ret);

App.addListener('appUrlOpen', (data: any) => {
  console.log('App opened with URL: ' +  data.url);
});

App.addListener('appRestoredResult', (data: any) => {
  console.log('Restored state:', data);
});
```

## Android: Use appRestoredResult

On Android, due to memory constraints on low-end devices, it's possible that, if your app launches a new activity, your app will be terminated by the operating system
in order to reduce memory consumption. 

For example, that means the `Camera` API, which launches a new Activity to take a photo, may not be able to return data back to your app.

To avoid this, Capacitor stores all restored activity results on launch. You should add a listener for `appRestoredResult` in order to handle any 
plugin call results that were delivered when your app was not running.

Once you have that result (if any), you can update the UI to restore a logical experience for the user, such as navigating or selecting the proper tab.

We recommend every Android app using plugins that rely on external Activities (for example, Camera) to have this event and process handled.

## API

<plugin-api name="app"></plugin-api>