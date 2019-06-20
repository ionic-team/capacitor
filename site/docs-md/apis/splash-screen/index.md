---
title: Splash Screen
description: Splash Screen API
url: /docs/apis/splash-screen
contributors:
  - mlynch
  - jcesarmobile
  - trancee
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Splash Screen

The Splash Screen API provides methods for showing or hiding a Splash image.

<plugin-api index="true" name="splash-screen"></plugin-api>

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

If you want to be sure the splash never hides before the app is fully loaded, set `launchAutoHide` to `false` in your `capacitor.config.json`:

```json
{
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": false
    }
  }
}
```

Then run `npx cap copy` to apply these changes.

## Background Color

In certain conditions, especially if the splash screen does not fully cover the device screen, it might happen that the app screen is visible around the corners (due to transparency). Instead of showing a transparent color, you can set a `backgroundColor` to cover those areas.

Possible values for `backgroundColor` in your `capacitor.config.json` are either `#RGB` or `#ARGB`.

## Spinner

If you want to show a spinner on top of the splash screen, set `showSpinner` to `true` in your `capacitor.config.json`:

```json
{
  "plugins": {
    "SplashScreen": {
      "showSpinner": true
    }
  }
}
```

You can customize the appearance of the spinner with the following configuration.

For Android, `androidSpinnerStyle` has the following options:
- horizontal
- small
- large (default)
- inverse
- smallInverse
- largeInverse

For iOS, `iosSpinnerStyle` has the following options:
- large (default)
- small

To set the color of the spinner use `spinnerColor`, values are either `#RGB` or `#ARGB`.

Then run `npx cap copy` to apply these changes.

## Configuration

These config parameters are available in `capacitor.config.json`:

```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "launchAutoHide": true,
      "backgroundColor": "#ffffffff",
      "androidSplashResourceName": "splash",
      "androidScaleType": "CENTER_CROP",
      "androidSpinnerStyle": "large",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#999999",
      "showSpinner": true
    }
  }
}
```

### Android

If your splash screen images aren't named "splash.png" but for example "screen.png" you have to change `"androidSplashResourceName": "screen"` in `capacitor.config.json` and change the following files in you're Android app as well:

`android/app/src/main/res/drawable/launch_splash.xml`

replace
```xml
<bitmap xmlns:android="http://schemas.android.com/apk/res/android"
    android:src="@drawable/splash"
    android:scaleType="centerCrop"
    />
```
with
```xml
<bitmap xmlns:android="http://schemas.android.com/apk/res/android"
    android:src="@drawable/screen"
    android:scaleType="centerCrop"
    />
```

`android/app/src/main/res/values/styles.xml`

replace
```xml
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
    </style>
```
with
```xml
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/screen</item>
    </style>
```

## Example Guides

[Adding Your Own Icons and Splash Screen Images &#8250;](https://www.joshmorony.com/adding-icons-splash-screens-launch-images-to-capacitor-projects/)

[Creating a Dynamic/Adaptable Splash Screen for Capacitor (Android) &#8250;](https://www.joshmorony.com/creating-a-dynamic-universal-splash-screen-for-capacitor-android/)

## API

<plugin-api name="splash-screen"></plugin-api>
