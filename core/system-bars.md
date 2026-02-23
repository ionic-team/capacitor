# SystemBars

The SystemBars API provides methods for configuring the style and visibility of the device System Bars / Status Bar. This plugin is bundled with `@capacitor/core`.

This API differs from the [Status Bar](https://capacitorjs.com/docs/apis/status-bar) plugin in that it is only intended to support modern edge to edge use cases moving forward.  For legacy functionality, use the [Status Bar](https://capacitorjs.com/docs/apis/status-bar) plugin.

| Feature | System Bars | Status Bar |
| ------- | ----------- | ---------- |
| `setOverlaysWebView()` | Unsupported | Supported on iOS and Android <= 14 (or 15 if edge to edge opt-out is enabled) |
| `setBackgroundColor()` | Unsupported | Supported |
| `setStyle()` | Supported | Supported - top Status Bar only |
| `hide()/show()` | Supported | Supported - top Status Bar only |

## iOS Note

This plugin requires "View controller-based status bar appearance"
(`UIViewControllerBasedStatusBarAppearance`) set to `YES` in `Info.plist`. Read
about [Configuring iOS](https://capacitorjs.com/docs/ios/configuration) for
help.

The status bar visibility defaults to visible and the style defaults to
`Style.Default`. You can change these defaults by adding
`UIStatusBarHidden` and/or `UIStatusBarStyle` in `Info.plist`.

## Android Note

Due to a [bug](https://issues.chromium.org/issues/40699457) in some older versions of Android WebView (< 140), correct safe area values are not available via the `safe-area-inset-x` CSS `env` variables.  This plugin will inject the correct inset values into a new CSS variable(s) named `--safe-area-inset-x` that you can use as a fallback in your frontend styles:

```css
html {
  padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
  padding-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
  padding-right: var(--safe-area-inset-right, env(safe-area-inset-right, 0px));
}
```
To control this behavior, use the `insetsHandling` configuration setting.

## Example

```typescript
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';

const setSystemBarStyleDark = async () => {
  await SystemBars.setStyle({ style: SystemBarsStyle.Dark });
};

const setSystemBarStyleLight = async () => {
  await SystemBars.setStyle({ style: SystemBarsStyle.Light });
};

const hideSystemBars = async () => {
  await SystemBars.hide();
};

const showSystemBars = async () => {
  await SystemBars.show();
};

const hideNavigationBar = async () => {
  await SystemBars.hide({
    bar: SystemBarType.NavigationBar
  })
}

// Set the Status Bar animation, only on iOS
const setStatusBarAnimation = async () => {
  await SystemBars.setAnimation({ animation: "NONE" });
}

````

## Configuration
| Prop          | Type                 | Description                                                               | Default            |
| ------------- | -------------------- | ------------------------------------------------------------------------- | ------------------ |
| **`insetsHandling`** | <code>string</code> | Specifies how to handle problematic insets on Android.  This option is only supported on Android.<br>`css` = Injects CSS variables (`--safe-area-inset-*`) containing correct safe area inset values into the webview.<br>`disable` = Disable all inset handling. | <code>css</code> |
| **`style`** | <code>string</code> | The style of the text and icons of the system bars. | <code>DEFAULT</code> |
| **`hidden`** | <code>boolean</code> | Hide the system bars on start. | <code>false</code> |
| **`animation`** | <code>string</code> | The type of status bar animation used when showing or hiding.  This option is only supported on iOS. | <code>FADE</code> |


### Example Configuration

In `capacitor.config.json`:

```json
{
  "plugins": {
    "SystemBars": {
      "insetsHandling": "css",
      "style": "DARK",
      "hidden": false,
      "animation": "NONE"
    }
  }
}
```

In `capacitor.config.ts`:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      style: "DARK",
      hidden: false,
      animation: "NONE"
    },
  },
};

export default config;
```

## API

<docgen-index>

* [`setStyle(...)`](#setstyle)
* [`show(...)`](#show)
* [`hide(...)`](#hide)
* [`setAnimation(...)`](#setanimation)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setStyle(...)

```typescript
setStyle(options: SystemBarsStyleOptions) => Promise<void>
```

Set the current style of the system bars.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsstyleoptions">SystemBarsStyleOptions</a></code> |

**Since:** 8.0.0

--------------------


### show(...)

```typescript
show(options?: SystemBarsVisibilityOptions) => Promise<void>
```

Show the system bars.

| Param         | Type                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsvisibilityoptions">SystemBarsVisibilityOptions</a></code> |

**Since:** 8.0.0

--------------------


### hide(...)

```typescript
hide(options?: SystemBarsVisibilityOptions) => Promise<void>
```

Hide the system bars.

| Param         | Type                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsvisibilityoptions">SystemBarsVisibilityOptions</a></code> |

**Since:** 8.0.0

--------------------


### setAnimation(...)

```typescript
setAnimation(options: SystemBarsAnimationOptions) => Promise<void>
```

Set the animation to use when showing / hiding the status bar.

Only available on iOS.

| Param         | Type                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsanimationoptions">SystemBarsAnimationOptions</a></code> |

**Since:** 8.0.0

--------------------


### Interfaces


#### SystemBarsStyleOptions

| Prop        | Type                                                        | Description                                     | Default                | Since |
| ----------- | ----------------------------------------------------------- | ----------------------------------------------- | ---------------------- | ----- |
| **`style`** | <code><a href="#systembarsstyle">SystemBarsStyle</a></code> | Style of the text and icons of the system bars. | <code>'DEFAULT'</code> | 8.0.0 |
| **`bar`**   | <code><a href="#systembartype">SystemBarType</a></code>     | The system bar to which to apply the style.     | <code>null</code>      | 8.0.0 |


#### SystemBarsVisibilityOptions

| Prop            | Type                                                                | Description                                                                                         | Default             | Since |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----- |
| **`bar`**       | <code><a href="#systembartype">SystemBarType</a></code>             | The system bar to hide or show.                                                                     | <code>null</code>   | 8.0.0 |
| **`animation`** | <code><a href="#systembarsanimation">SystemBarsAnimation</a></code> | The type of status bar animation used when showing or hiding. This option is only supported on iOS. | <code>'FADE'</code> | 8.0.0 |


#### SystemBarsAnimationOptions

| Prop            | Type                                                                | Description                                                                                         | Default             | Since |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----- |
| **`animation`** | <code><a href="#systembarsanimation">SystemBarsAnimation</a></code> | The type of status bar animation used when showing or hiding. This option is only supported on iOS. | <code>'FADE'</code> | 8.0.0 |


### Type Aliases


#### SystemBarsAnimation

Available status bar animations.  iOS only.

<code>'FADE' | 'NONE'</code>


### Enums


#### SystemBarsStyle

| Members       | Value                  | Description                                                                                                                                                                                                              | Since |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **`Dark`**    | <code>'DARK'</code>    | Light system bar content on a dark background.                                                                                                                                                                           | 8.0.0 |
| **`Light`**   | <code>'LIGHT'</code>   | For dark system bar content on a light background.                                                                                                                                                                       | 8.0.0 |
| **`Default`** | <code>'DEFAULT'</code> | The style is based on the device appearance or the underlying content. If the device is using Dark mode, the system bars content will be light. If the device is using Light mode, the system bars content will be dark. | 8.0.0 |


#### SystemBarType

| Members             | Value                        | Description                                                         | Since |
| ------------------- | ---------------------------- | ------------------------------------------------------------------- | ----- |
| **`StatusBar`**     | <code>'StatusBar'</code>     | The top status bar on both Android and iOS.                         | 8.0.0 |
| **`NavigationBar`** | <code>'NavigationBar'</code> | The navigation bar (or gesture bar on iOS) on both Android and iOS. | 8.0.0 |

</docgen-api>
