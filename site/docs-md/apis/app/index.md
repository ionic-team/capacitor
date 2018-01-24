# App

The App API handles high level App state and events.

For example, this API emits events when the app enters and leaves the foreground, handles
deeplinks, opens other apps, and manages persisted plugin state.

<plugin-api index="true" name="app"></plugin-api>

## Example

```typescript
import { Plugins, AppState } from '@avocadojs/core';

Plugins.App.addListener('appStateChanged', (err: any, state: AppState) => {
  // state.isActive contains the active state
  console.log('App state changed. Is active?', state.isActive);
});

// Listen for serious plugin errors
Plugins.App.addListener('pluginError', (err: any, info: any) => {
  console.error('There was a serious error with a plugin', err, info);
});

var ret = await Plugins.App.canOpenUrl({ url: 'com.getcapacitor.myapp' });
console.log('Can open url: ', ret.value);

ret = await Plugins.App.openUrl({ url: 'com.getcapacitor.myapp://page?id=ionicframework' });
console.log('Open url response: ', ret);

ret = await Plugins.App.getLaunchUrl();
if(ret && ret.url) {
  console.log('App opened with URL: ' + ret.url);
}
console.log('Launch url: ', ret);

Plugins.App.addListener('appUrlOpen', (err: any, data: any) => {
  console.log('App opened with URL: ' +  data.url);
});

Plugins.App.addListener('appRestoredResult', (err: any, data: any) => {
  console.log('Restored state:', data);
});
```

## Android: Use appRestoredResult

On Android, due to memory constraints on low-end devices, it's possible that, if your app launches a new activity, your app will be terminated by the operating system
in order to reduce memory consumption. 

That means, for example, the `Camera` API, which launches a new Activity to take a photo, may not be able to return data back to your app.

To avoid this, Capacitor stores all restored activity results on launch. You should listen for `appRestoredResult` in order to handle any 
plugin call results that were delivered when your app was not running.

Once you have that result (if any), you can update the UI to restore a logical experience for the user, such as navigating or selecting the proper tab.

We recommend every app using plugins that rely on external Activities (for example, Camera) to have this event and processed handled.


## API

<plugin-api name="app"></plugin-api>