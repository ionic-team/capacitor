# Share

The Share API provides methods for sharing content in any sharing-enabled apps the user may have installed.

The Share API works on iOS, Android, and the Web (using the new [Web Share API](https://developers.google.com/web/updates/2016/09/navigator-share)).

## Example

```typescript
import { Plugins } from '@capacitore/core';
const { Share } = Plugins;

let shareRet = await Share.share({
  title: 'See cool stuff',
  text: 'Really awesome thing you need to see right meow',
  url: 'http://ionicframework.com/',
  dialogTitle: 'Share with buddies'
});
```

Each platform uses a different set of fields, but you should supply them all.

## API

<plugin-api name="share"></plugin-api>