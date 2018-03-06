# Building Electron Apps

Electron Apps are JavaScript applications that run on desktops of the major operating systems including Linux, Windows, and Mac.

Capacitor supports Electron Apps, which means your web apps can run on the desktop.

## Using Capacitor Core

Capacitor Core is a JavaScript library that runs on all platforms that Capacitor supports, and desktop is no different.

### With a Build System

Generally, apps will be using a framework with a build system that supports importing JavaScript modules.

In your apps `index.html`, be sure to import `capacitor.js` before your app's JS:

```html
<script src="capacitor.js"></script>
<script src="your/app.js"></script>
```

Then simply import Capacitor at the top of your app and you're set:

```typescript
import { Capacitor } from '@capacitor/core';
```

To use a plugin, import `Plugins` and call it, noting that only plugins
with web support will actually provide useful functionality:

```typescript
import { Plugins } from '@capacitor/core';

const position = await Plugins.Geolocation.getCurrentPosition();

OR

const { Geolocation } = Plugins;
let position = await Geolocation.getCurrentPosition();
```

Run your build script/process then copy it into the electron project:

```bash
npx cap copy electron
```

## Developing

Simply `cd` into the electron project `your_great_app/electron` and run `npm run electron:start` and electron will boot up your app with full Chrome Devtools support.

## Distributing

Coming soon...