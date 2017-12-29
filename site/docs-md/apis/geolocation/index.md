# Geolocation

The Geolocation API provides simple methods for getting and tracking the current position of the device using GPS.

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