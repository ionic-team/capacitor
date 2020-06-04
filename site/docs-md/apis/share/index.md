---
title: Share
description: Share API
url: /docs/apis/share
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Share

The Share API provides methods for sharing content in any sharing-enabled apps the user may have installed.

The Share API works on iOS, Android, and the Web (using the new [Web Share API](https://developers.google.com/web/updates/2016/09/navigator-share)), though web support is currently spotty.

<plugin-api index="true" name="share"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

let shareRet = await Share.share({
  title: 'See cool stuff',
  text: 'Really awesome thing you need to see right meow',
  url: 'http://ionicframework.com/',
  dialogTitle: 'Share with buddies'
});
```

## API

<plugin-api name="share"></plugin-api>