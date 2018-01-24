# Browser

The Browser API makes it easy to open an in-app browser session to show external web content,
handle authentication flows, and more.

On iOS this uses `SFSafariViewController` and is compliant with leading oAuth service in-app-browser requirements.

```typescript
import { Plugins } from '@capacitor/core';

Plugins.Browser.open('http://ionic-team.github.io/capacitor');
```

## API

<plugin-api name="browser"></plugin-api>