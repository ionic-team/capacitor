---
title: Device
description: Device API
url: /docs/apis/device
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Device

The Device API exposes internal information about the device, such as the model and operating system version, along with user information
such as unique ids.

<plugin-api name="device" index="true"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';

const { Device } = Plugins;

const info = await Device.getInfo();
console.log(info);

// Example output:
{
  "diskFree": 12228108288,
  "appVersion": "1.0.2",
  "appBuild": "123",
  "operatingSystem": "ios",
  "osVersion": "11.2",
  "platform": "ios",
  "memUsed": 93851648,
  "diskTotal": 499054952448,
  "model": "iPhone",
  "manufacturer": "Apple",
  "uuid": "84AE7AA1-7000-4696-8A74-4FD588A4A5C7",
  "isVirtual":true
}

const info = await Device.getBatteryInfo();
console.log(info);

// Example output:
{
  "batteryLevel": -1,
  "isCharging": true
}
```

## API

<plugin-api name="device"></plugin-api>