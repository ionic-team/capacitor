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

Due to a [bug](https://issues.chromium.org/issues/40699457) in some older versions of Android WebView (< 140), correct safe area values are not available via the `safe-area-inset-x` CSS `env` variables. This plugin has two ways to workaround this. To control this behavior, use the `insetsHandling` configuration setting.

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
| **`insetsHandling`** | <code>string</code> | Specifies how to handle problematic insets on Android.  This option is only supported on Android.<br>`native` = (recommended) For older Chromium versions (< v140) this embeds the webview with padding and sets the `env(safe-area-inset-*)` variables to `0px`. For newer Chromium versions (>= 140) this makes sure the webview adheres to the `viewport-fit` meta tag. If set to `viewport-fit="cover"` this will make the webview edge-to-edge and the `env(safe-area-inset-*)` variables will contain the correct values. With those values you could set padding for example so make sure the webview is shown correctly.<br>`css` = This is the same as `native`, but it also injects CSS variables (`--safe-area-inset-*`) containing correct safe area inset values into the webview.<br>`disable` = Disable CSS variables injection. | <code>css</code> |
| **`detectViewportFitCoverChanges`** | <code>boolean</code> | This plugin detects changes to the `viewport-fit` meta tag. This comes in handy when you do not know for sure if the content loaded into the webview will have `viewport-fit` set to `cover`. For most use cases you do not need to touch this config variable. However if you know for sure you want to always keep the `initialViewportFitCover` value unchanged, you could disable this feature by setting it to `false`. Be aware that this might result in a visually broken UI if the content loaded into the webview does not correctly handle safe area insets. This option is only supported on Android. | <code>true</code> |
| **`initialViewportFitCover`** | <code>boolean</code> | Set an initial value for the to be detected `viewport-fit=cover`. For most apps that support edge-to-edge this value will eventually be `true`. Therefore you might want to set this value is to `true` to help prevent layout jumps and glitches. If you know (or want) the value to be `true` initially, you can set it here. The value will always end up correctly, no matter what you set here, as long as `detectViewportFitCoverChanges` is set to `true`. It only exists to help prevent layout jumps and glitches. This option is only supported on Android. | <code>false</code> |
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
