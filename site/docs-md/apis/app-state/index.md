# AppState

The AppState API emits events when the app enters and leaves, among other 
high level operations.

## Example

```typescript
import { Plugins, AppStateState } from '@avocadojs/core';

Plugins.AppState.addListener('appStateChanged', (err: any, state: AppStateState) => {
  // state.isActive contains the active state
  console.log('App state changed. Is active?', state.isActive);
});

// Listen for serious plugin errors
Plugins.AppState.addListener('pluginError', (err: any, info: any) => {
  console.error('There was a serious error with a plugin', err, info);
});
```


## API

<plugin-api name="app-state"></plugin-api>