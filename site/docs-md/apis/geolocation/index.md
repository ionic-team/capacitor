# Geolocation

The Geolocation API provides simple methods for getting and tracking the current position of the device using GPS, along
with altitude, heading, and speed information if available.

## iOS Notes

Apple requires privacy descriptions to be specified in `Info.plist` for location information:

Name: Privacy - Location Always Usage Description
Key: NSLocationAlwaysUsageDescription

Name: Privacy - Location When In Use Usage Description
Key: NSLocationWhenInUseUsageDescription

Read about [Setting iOS Permissions](../ios/permissions/) in the [iOS Guide](../ios) for more information on setting iOS permissions in Xcode

## Android Notes

This API requires the following permissions to be added to your `AndroidManifest.xml`:

```xml
<!-- Geolocation API -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

Read about [Setting Android Permissions]('../android/permissions/) in the [Android Guide](../android) for more information on setting Android permissions.

## Example

```typescript
class GeolocationExample {
  async getCurrentPosition() {
    const coordinates = await Plugins.Geolocation.getCurrentPosition()
    console.log('Current', coordinates);
  }

  watchPosition() {
    const wait = Plugins.Geolocation.watchPosition({}, (err, position) => {
    })
  }
}
```

## API

<plugin-api name="geolocation"></plugin-api>