---
title: Keyboard
description: Keyboard API
url: /docs/apis/keyboard
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="ios,android"></plugin-platforms>

# Keyboard

The Keyboard API provides keyboard display and visibility control, along with event tracking when the keyboard shows and hides.

<plugin-api index="true" name="keyboard"></plugin-api>


## Window Events for cordova-plugin-ionic-keyboard compatibility

* keyboardWillShow
* keyboardDidShow
* keyboardWillHide
* keyboardDidHide

## Example

```typescript
import { Plugins, KeyboardInfo } from '@capacitor/core';

const { Keyboard } = Plugins;

// Keyboard Plugin Events

Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
  console.log('keyboard will show with height', info.keyboardHeight);
});

Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
  console.log('keyboard did show with height', info.keyboardHeight);
});

Keyboard.addListener('keyboardWillHide', () => {
  console.log('keyboard will hide');
});

Keyboard.addListener('keyboardDidHide', () => {
  console.log('keyboard did hide');
});

// window events

window.addEventListener('keyboardWillShow', (e) => {
  console.log('keyboard will show with height', (<any>e).keyboardHeight);
});

window.addEventListener('keyboardDidShow', (e) => {
  console.log("keyboard did show with height", (<any>e).keyboardHeight);
});

window.addEventListener('keyboardWillHide', () => {
  console.log('keyboard will hide');
});

window.addEventListener('keyboardDidHide', () => {
  console.log('keyboard did hide');
});

// API

Keyboard.setAccessoryBarVisible({isVisible: false});

Keyboard.show();

Keyboard.hide();

```

## Keyboard configuration (iOS only)

The keyboard plugin allows the following configuration values to be added in `capacitor.config.json` for the iOS platform:

- `resize`: It configures the way the app is resized when the Keyboard appears.
Allowed values are
  - `none`: Not the app, nor the webview are resized
  - `native`: (default) The whole native webview will be resized when the keyboard shows/hides, it will affect the `vh` relative unit.
  - `body`: Only the html `<body>` element will be resized. Relative units are not affected, because the viewport does not change.
  - `ionic`: Only the html ion-app element will be resized. Use it only for ionic apps.

- `style`: If set to `dark` it will use Dark style keyboard instead of the regular one.

```json
{
  "plugins": {
    "Keyboard": {
      "resize": "body",
      "style": "dark"
    }
  }
}
```

## API

<plugin-api name="keyboard"></plugin-api>
