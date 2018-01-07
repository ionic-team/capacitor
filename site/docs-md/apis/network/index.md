# Network

## Android Note

The Network API requires the following permission be added to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

This permission allows the app to access information about the current network, such as whether it is connected to wifi or cellular.

## API

<plugin-api name="network"></plugin-api>