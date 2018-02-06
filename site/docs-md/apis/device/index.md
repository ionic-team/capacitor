# Device

The Device API exposes internal information about the device

## Example


```typescript
const { Device } = Plugins;

const info = await Device.getInfo();
console.log(info);

// Example output:
{
  "diskFree": 12228108288,
  "osVersion": "11.2",
  "platform": "ios",
  "memUsed": 93851648,
  "battery": -1,
  "diskTotal": 499054952448,
  "model": "iPhone",
  "manufacturer": "Apple",
  "uuid": "84AE7AA1-7000-4696-8A74-4FD588A4A5C7",
  "isVirtual":true
}
```

## API

<plugin-api name="device"></plugin-api>