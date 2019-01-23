<plugin-platforms platforms="ios,android"></plugin-platforms>

# Keyboard

The Keyboard API provides keyboard display and visibility control, along with event tracking when the keyboard shows and hides.

<plugin-api index="true" name="keyboard"></plugin-api>


## Events

* keyboardWillShow
* keyboardDidShow
* keyboardWillHide
* keyboardDidHide

## Example

```typescript

// Events

window.addEventListener('keyboardWillShow', (e) => {
  console.log("keyboard will show with height", (<CustomEvent>e).detail.keyboardHeight);
});

window.addEventListener('keyboardDidShow', (e) => {
  console.log("keyboard did show with height", (<CustomEvent>e).detail.keyboardHeight);
});

window.addEventListener('keyboardWillHide', () => {
  console.log("keyboard will hide");
});

window.addEventListener('keyboardDidHide', () => {
  console.log("keyboard did hide");
});

// API

import { Plugins } from '@capacitor/core';

const { Keyboard } = Plugins;


Keyboard.setAccessoryBarVisible({isVisible: false});

Keyboard.show();

Keyboard.hide();

```

## Keyboard configuration (iOS only)

Keyboard plugin allow this configurations for iOS

- `resize`: It configures the way the app is resized when the Keyboard appears.
Allowed values are
  - `none`: Not the app, nor the webview are resized
  - `native`: The whole native webview will be resized when the keyboard shows/hides, it will affect the `vh` relative unit.
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