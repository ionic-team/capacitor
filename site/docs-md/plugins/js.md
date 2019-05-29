---
title: Capacitor JavaScript Plugin Guide
description: Capacitor JavaScript Plugin Guide
url: /docs/plugins/js
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor JavaScript Plugin Guide

<p class="intro">In Capacitor, Native Plugins have all of their methods automatically made available to JavaScript at runtime, so the majority of plugins won't need any JavaScript for their plugin at all.</p>

<p class="intro">However, if your plugin requires some special JavaScript, or you'd like to provide a custom API for your plugin, you can easily add a JavaScript frontend to your Capacitor plugin.</p>

## Getting Started

To build a custom JavaScript frontend for Capacitor, first follow the [Getting Started](../plugins) section of the plugin guide.

Next, build out your plugin any way you see fit! The generated plugin template comes with TypeScript and a simple build process ready to go. You can adopt that (recommended) or remove those files and start fresh.

To call your plugin, you'll be able to access it directly after importing from `@capacitor/core`:

```typescript
import { Plugins } from '@capacitor/core';

const { SuperGreatPlugin } = Plugins;

export class CustomSuperPlugin {
  constructor() {
  }
  customAwesomeness() {
    SuperGreatPlugin.awesome();
  }
}
```

## Publishing

To publish your plugin, just `npm publish` it!

## Consuming your Plugin

One of the differences with custom JS plugins is how developers "consume" it. Instead of accessing `Plugins.SuperGreatPlugin` directly, developers will instead import from your npm package directly:

```typescript
import { CustomSuperPlugin } from 'super-great-plugin';

const plugin = new CustomSuperPlugin();
plugin.customAwesomeness();
```
