# Accessibility

The Accessibility API makes it easy to know when a user has a screen reader enabled, as well as programatically speaking
labels through the connected screen reader.

<plugin-api index="true" name="accessibility"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';

Plugins.Accessibility.addListener('accessibilityScreenReaderStateChange', (err, state) => {
  console.log(state.value);
});

async isVoiceOverEnabled() {
  var vo = await Plugins.Accessibility.isScreenReaderEnabled();
  alert('Voice over enabled? ' + vo);
}

async speak() {
  var value = await Plugins.Modals.prompt({
    title: "Value to speak",
    message: "Enter the value to speak"
  });

  Plugins.Accessibility.speak(value.value);
}
```

## API

<plugin-api name="accessibility"></plugin-api>