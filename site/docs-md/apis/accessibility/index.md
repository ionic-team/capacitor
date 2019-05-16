---
title: Accessibility
description: Accessibility API
url: /docs/apis/accessibility
contributors:
  - mlynch
  - jcesarmobile
---

<plugin-platforms platforms="ios,android"></plugin-platforms>

# Accessibility

The Accessibility API makes it easy to know when a user has a screen reader enabled, as well as programmatically speaking
labels through the connected screen reader.

<plugin-api index="true" name="accessibility"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';

const { Accessibility, Modals } = Plugins;

Accessibility.addListener('accessibilityScreenReaderStateChange', (state) => {
  console.log(state.value);
});

async isVoiceOverEnabled() {
  var vo = await Accessibility.isScreenReaderEnabled();
  alert('Voice over enabled? ' + vo.value);
}

async speak() {
  var value = await Modals.prompt({
    title: "Value to speak",
    message: "Enter the value to speak"
  });

  Accessibility.speak({value: value.value});
}
```

## API

<plugin-api name="accessibility"></plugin-api>