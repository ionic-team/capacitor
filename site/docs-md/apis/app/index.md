# App

The App API emits events when the app enters and leaves, among other 
high level operations. Additionally, the App API offers ways to query
launch URLs and respond to deep links.

## Example

```typescript
import { Plugins, AppStateState } from '@avocadojs/core';

Plugins.App.addListener('appStateChanged', (err: any, state: AppStateState) => {
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


## API

<plugin-api name="app-state"></plugin-api>