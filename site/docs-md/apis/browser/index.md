<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Browser

<plugin-api name="browser" index="true"></plugin-api>

The Browser API makes it easy to open an in-app browser session to show external web content,
handle authentication flows, and more.

On iOS this uses `SFSafariViewController` and is compliant with leading oAuth service in-app-browser requirements.

```typescript
import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;

await Browser.open('http://capacitor.ionicframework.com/');
```

## API

<plugin-api name="browser"></plugin-api>