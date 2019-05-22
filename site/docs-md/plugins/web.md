---
title: Capacitor Web/PWA Plugin Guide
description: Capacitor Web/PWA Plugin Guide
url: /docs/plugins/web
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor Web/PWA Plugin Guide

<p class="intro">Capacitor utilizes a web/native compatibility layer, making it easy to build plugins that have functionality when running natively, as well as when running in a PWA on the Web.</p>

## Getting Started

To get started, first generate a plugin as shown in the [Getting Started](./#getting-started) section of the Plugin guide.

Next, open `your-plugin/src/web.ts` in your editor of choice.

## Example

The basic structure of a Web plugin looks like this, follow the comments inline for
more explanation:

```typescript
import { WebPlugin } from '@capacitor/core';

export class MyPluginWeb extends WebPlugin {
  constructor() {
    // Call super with the name of our plugin (this should match the native name),
    // along with the platforms this plugin will activate on. For example, it's possible
    // to use a web plugin for Android and iOS by adding them to the platforms list (lowercased)
    super({
      name: 'MyPlugin',
      platforms: ['web']
    });
  }

  async echo(options: { value: string }) {
    console.log('ECHO', options);
    return options;
  }
}

// Instantiate the plugin
const MyPlugin = new MyPluginWeb();

// Export the plugin
export { MyPlugin };
```

Finally, make sure your `src/index.ts` has this line:

```typescript
export * from './web';
```
