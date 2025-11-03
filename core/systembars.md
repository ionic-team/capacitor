# SystemBars

The SystemBars API provides methods for configuring the style and visibility of the device System Bars / Status Bar.  This API differs from the [Status Bar](https://capacitorjs.com/docs/apis/status-bar) plugin in that it is only intended to support modern edge to edge use cases moving forward.  For legacy functionality, use the [Status Bar](https://capacitorjs.com/docs/apis/status-bar) plugin.

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

To disable the inset variable injections, set the configuration setting `enableInsets` to `false`.

## Example

```typescript
import { SystemBars, SystemBarsStyle } from '@capacitor/core';

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

// Hide the bottom navigation bar, only on Android
const hideNavigationBar = async () => {
  await SystemBars.hide({
    inset: "BOTTOM"
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
| **`enableInsets`** | <code>boolean</code> | Enables the injection of device css insets into the webview.  This option is only supported on Android. | <code>true</code> |
| **`style`** | <code>string</code> | The style of the text and icons of the system bars. | <code>DEFAULT</code> |
| **`hidden`** | <code>boolean</code> | Hide the system bars on start. | <code>false</code> |
| **`animation`** | <code>string</code> | The type of status bar animation used when showing or hiding.  This option is only supported on iOS. | <code>FADE</code> |


### Example Configuration

In `capacitor.config.json`:

```json
{
  "plugins": {
    "SystemBars": {
      "enableInsets": false,
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
      enableInsets: true,
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
show(options: SystemBarsVisibilityOptions) => Promise<void>
```

Show the system bars.

| Param         | Type                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsvisibilityoptions">SystemBarsVisibilityOptions</a></code> |

**Since:** 8.0.0

--------------------


### hide(...)

```typescript
hide(options: SystemBarsVisibilityOptions) => Promise<void>
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

| Prop        | Type                                                                                                         | Description                                     | Default              | Since |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | -------------------- | ----- |
| **`style`** | <code><a href="#systembarsstyle">SystemBarsStyle</a></code>                                                  | Style of the text and icons of the system bars. | <code>default</code> | 8.0.0 |
| **`inset`** | <code><a href="#omit">Omit</a>&lt;<a href="#systembarsinsets">SystemBarsInsets</a>, 'LEFT, RIGHT'&gt;</code> | The inset edge for which to apply the style.    | <code>null</code>    | 8.0.0 |


#### SystemBarsVisibilityOptions

| Prop            | Type                                                                | Description                                                                                         | Default             | Since |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----- |
| **`inset`**     | <code><a href="#systembarsinsets">SystemBarsInsets</a></code>       | The inset edge for which to hide.                                                                   | <code>null</code>   | 8.0.0 |
| **`animation`** | <code><a href="#systembarsanimation">SystemBarsAnimation</a></code> | The type of status bar animation used when showing or hiding. This option is only supported on iOS. | <code>'FADE'</code> | 8.0.0 |


#### SystemBarsAnimationOptions

| Prop            | Type                                                                | Description                                                                                         | Default             | Since |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----- |
| **`animation`** | <code><a href="#systembarsanimation">SystemBarsAnimation</a></code> | The type of status bar animation used when showing or hiding. This option is only supported on iOS. | <code>'FADE'</code> | 8.0.0 |


### Type Aliases


#### Omit

Construct a type with the properties of T except for those in type K.

<code><a href="#pick">Pick</a>&lt;T, <a href="#exclude">Exclude</a>&lt;keyof T, K&gt;&gt;</code>


#### Pick

From T, pick a set of properties whose keys are in the union K

<code>{ [P in K]: T[P]; }</code>


#### Exclude

<a href="#exclude">Exclude</a> from T those types that are assignable to U

<code>T extends U ? never : T</code>


#### SystemBarsInsets

Available inset edges.

<code>'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'</code>


#### SystemBarsAnimation

Available status bar animations.  iOS only.

<code>'FADE' | 'NONE'</code>


### Enums


#### SystemBarsStyle

| Members       | Value                  | Description                                                                                                                                                                                                    | Since |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`Dark`**    | <code>'DARK'</code>    | Light system bar content on a dark background.                                                                                                                                                                 | 8.0.0 |
| **`Light`**   | <code>'LIGHT'</code>   | For dark system bar content on a light background.                                                                                                                                                             | 8.0.0 |
| **`Default`** | <code>'DEFAULT'</code> | The style is based on the device appearance or the underlying content. If the device is using Dark mode, the statusbar text will be light. If the device is using Light mode, the statusbar text will be dark. | 8.0.0 |

</docgen-api>
