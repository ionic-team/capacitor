<plugin-api index="true" name="splash-screen"></plugin-api>

# Splash Screen

The Splash Screen API provides methods for showing or hiding a Splash image.

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { SplashScreen } = Plugins;

// Hide the splash (you should do this on app launch)
SplashScreen.hide();

// Show the splash for an indefinite amount of time:
SplashScreen.show({
  autoHide: false
});

// Show the splash for two seconds and then auto hide:
SplashScreen.show({
  showDuration: 2000,
  autoHide: true
});
```

## Hiding the Splash Screen

By default, the Splash Screen is set to automatically hide after a certain amount of time (3 seconds). However, your
app should boot much faster than this!

To make sure you provide the fastest app loading experience to your users, you must hide the splash screen automatically when your app is ready to be used. Simply add the `SplashScreen.hide()` call near the top of your app's JS, such as in `app.component.ts` if using Angular.

If your app needs longer than 3 seconds to load, configure the default duration by setting `launchShowDuration` in your `capacitor.config.json`:

```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 5000
    }
  }
}
```

Then run `npx cap copy` to apply these changes.

## API

<plugin-api name="splash-screen"></plugin-api>
