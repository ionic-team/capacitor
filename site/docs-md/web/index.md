---
title: Capacitor Web Documentation
description: Web Getting Started
url: /docs/web
contributors:
  - mlynch
---

# Using Capacitor in a Web Project

<p class="intro">Capacitor fully supports traditional web and Progressive Web Apps. In fact, using Capacitor makes it easy to ship a PWA version of your iOS and Android app store apps with minimal work.</p>

### Installation

Chances are, you already have Capacitor installed in your app if you're using Capacitor to build an iOS, or Android app. In capacitor, the `web` platform is just the web project that powers your app!

If you don't have Capacitor installed yet, consult the [Installation](./getting-started) guide before continuing.

#### Using Capacitor as a Module

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

### Using Capacitor as a Script Include

To use Capacitor core in a web app that is not using a build system or bundler/module loader,
you must set `bundledWebRuntime` to `true` in your `capacitor.config.json`, tell capacitor to
copy the specified version of Capacitor Core into your project,
and then import `capacitor.js` into your `index.html`:

```json
{
  "bundledWebRuntime": true
}
```

Copy to your project:

```bash
npx cap copy web
```

In `index.html`, import `capacitor.js` before your app's JS:

```html
<script src="capacitor.js"></script>
<script src="your/app.js"></script>
```

## Developing your App

Chances are, you're using a framework like [Ionic](http://ionicframework.com/) for UI components and building. To develop
your Capacitor web app, just use your framework!

If you're not using a framework, Capacitor comes with a small development service with HTML5 routing support. To use it,
run:

```bash
npx cap serve
```

## Going Live

When you're ready to publish your Progressive Web App and share it with the world,
just upload the contents of your web directory (for example, the `www/` or `build/` folder).

That will contain everything you need to run your app!
