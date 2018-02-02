# Building Progressive Web Apps

Progressive Web Apps (PWA's) represent the evolution of the standard web app web developers have come to know and love. If you're not
familiar with them, that's okay! Think of them as browser apps that use some modern Web APIs to provide an app-like experience.

Capacitor supports Progressive Web Apps, which means it supports any kind of web app whether or not it uses these APIs.

## Using Capacitor Core

Capacitor Core is a JavaScript library that runs on all platforms that Capacitor supports, and web is no different.

### With a Build System

Generally, apps will be using a framework with a build system that supports importing JavaScript modules. In that case,
simply import Capacitor at the top of your app and you're set:

```typescript
import { Capacitor } from '@capacitor/core';
```

To use a plugin, import `Plugins` and call it, noting that only plugins
with web support will actually provide useful functionality:

```typescript
import { Plugins } from '@capacitor/core';

const position = await Plugins.Geolocation.getCurrentPosition();
```

### Without a Build System

To use Capacitor core in a web app that is not using a build system or bundler/module loader,
you must set `bundleWebRuntime` to `true` in your `capacitor.config.json`, tell capacitor to
copy the specified version of Capacitor Core into your project,
and then import `capacitor.js` into your `index.html`:

```json
{
  "bundleWebRuntime": true
}
```

Copy to your project:

```bash
npx capacitor copy web
```

In `index.html`, import `capacitor.js` before your app's JS:

```html
<script src="capacitor.js"></script>
<script src="your/app.js"></script>
```

## Developing

Chances are, you're using a framework like [Ionic](http://ionicframework.com/) for UI components and building. To develop
your Capacitor web app, just use your framework!

If you're not using a framework, Capacitor comes with a small development service with HTML5 routing support. To use it,
run:

```bash
npx capacitor serve
```

## Going Live

When you're ready to publish your Progressive Web App and share it with the world,
just upload the contents of your web directory (default: `public/`). That will contain
everything you need to run your app!