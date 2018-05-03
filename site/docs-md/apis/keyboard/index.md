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

## API

<plugin-api name="keyboard"></plugin-api>