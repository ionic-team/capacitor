---
title: Toast
description: Toast API
url: /docs/apis/toast
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Toast

The Toast API provides a notification pop up for displaying important information to a user. Just like real toast!

<plugin-api index="true" name="toast"></plugin-api>

## PWA/Electron Notes

[PWA Elements](/docs/pwa-elements) are required for Toast plugin to work.

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { Toast } = Plugins;

async show() {
  await Toast.show({
    text: 'Hello!'
  });
}
```

## API

<plugin-api name="toast"></plugin-api>