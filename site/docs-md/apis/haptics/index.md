# Haptics

The Haptics API provides physical feedback to the user through touch or vibration.

## Example

```typescript
import {
  Plugins,
  HapticsImpactStyle
} from '@avocadojs/core';

export class HapticsExample {
  hapticsImpact(style = HapticsImpactStyle.Heavy) {
    Plugins.Haptics.impact({
      style: style
    });
  }

  hapticsImpactMedium(style) {
    this.hapticsImpact(HapticsImpactStyle.Medium);
  }

  hapticsImpactLight(style) {
    this.hapticsImpact(HapticsImpactStyle.Light);
  }

  hapticsVibrate() {
    Plugins.Haptics.vibrate();
  }

  hapticsSelectionStart() {
    Plugins.Haptics.selectionStart();
  }

  hapticsSelectionChanged() {
    Plugins.Haptics.selectionChanged();
  }

  hapticsSelectionEnd() {
    Plugins.Haptics.selectionEnd();
  }
}
```

## API

<plugin-api name="haptics"></plugin-api>