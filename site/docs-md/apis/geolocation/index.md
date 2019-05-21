---
title: Geolocation
description: Geolocation API
url: /docs/apis/geolocation
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Geolocation

The Geolocation API provides simple methods for getting and tracking the current position of the device using GPS, along
with altitude, heading, and speed information if available.

<plugin-api index="true" name="geolocation"></plugin-api>

## iOS Notes

Apple requires privacy descriptions to be specified in `Info.plist` for location information:

Name: `Privacy - Location Always Usage Description`
Key: `NSLocationAlwaysUsageDescription`

Name: `Privacy - Location When In Use Usage Description`
Key: `NSLocationWhenInUseUsageDescription`

Read about [Setting iOS Permissions](../ios/configuration/) in the [iOS Guide](../ios/) for more information on setting iOS permissions in Xcode

## Android Notes

This API requires the following permissions be added to your `AndroidManifest.xml`:

```xml
<!-- Geolocation API -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

The first two permissions ask for location data, both fine and coarse, and the last line is optional but necessary if your app _requires_ GPS to function. You may leave it out, though keep in mind that this may mean your app is installed on devices lacking GPS hardware.

Read about [Setting Android Permissions](../android/configuration/) in the [Android Guide](../android/) for more information on setting Android permissions.

## Example

```typescript
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

class GeolocationExample {
  async getCurrentPosition() {
    const coordinates = await Geolocation.getCurrentPosition();
    console.log('Current', coordinates);
  }

  watchPosition() {
    const wait = Geolocation.watchPosition({}, (position, err) => {
    })
  }
}
```

## API

<plugin-api name="geolocation"></plugin-api>
