# DisplayFeatures

The DisplayFeatures API exposes native display metadata that web content cannot read from CSS alone: the active size classes, safe-area insets and bounds of the web view, and, on hardware and OS versions that provide them, the device pose and reserved regions described in Apple's [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) Human Interface Guidelines. This plugin is bundled with `@capacitor/core`.

## You may not need this plugin

WKWebView already resizes with the window and exposes `env(safe-area-inset-*)` to CSS, so **basic layout adaptation on iPhone Duo works without this plugin**. Build your layout with relative units and safe-area insets first.

Use this plugin when JavaScript needs to make a decision the CSS environment cannot express:

- which size class is active (the HIG's primary signal for the outer vs. inner display),
- whether the device is partially folded, and where the folding region is,
- where an active camera region sits, so a custom component can move aside.

## iOS Note

Size classes, safe-area insets and bounds are real values on every iOS device. Pose and reserved regions are only reported when the OS exposes them; until then `supported` is `false`, `pose` and `activeDisplay` are `unknown`, and `reservedRegions` is empty. The plugin never guesses a pose from the device model.

As of September 2026 the iOS 27.1 SDK that ships the iPhone Duo reserved-region APIs is not public (Apple lists the Xcode 27.1 beta as "coming later this month"), so the current release reports `supported: false` everywhere. The native integration point is `DisplayFeaturesProvider` in `DisplayFeatures.swift`.

`displayFeaturesChanged` fires on size class changes (iOS 17 and later) and on orientation changes, and only when the reported state actually changed.

## Android Note

Not implemented yet. Calls reject with `ExceptionCode.Unimplemented`.

## Example

```typescript
import { DisplayFeatures } from '@capacitor/core';

const applyLayout = async () => {
  const state = await DisplayFeatures.getDisplayFeatures();

  // The HIG recommends driving layout from size classes:
  // compact width = outer display, regular width = inner display.
  document.body.dataset.width = state.horizontalSizeClass;

  if (state.supported) {
    const fold = state.reservedRegions.find((region) => region.type === 'fold');
    if (fold) {
      // keep custom content out of the folding region
    }
  }
};

await DisplayFeatures.addListener('displayFeaturesChanged', (state) => {
  document.body.dataset.width = state.horizontalSizeClass;
});
```

## API

<docgen-index>

</docgen-index>

<docgen-api>

</docgen-api>
