# SystemBars

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

| Prop        | Type                                                                                                         | Description                                                             | Default              | Since |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------- | ----- |
| **`style`** | <code><a href="#systembarsstyle">SystemBarsStyle</a></code>                                                  | Style of the text and icons of the system bars.                         | <code>default</code> | 8.0.0 |
| **`inset`** | <code><a href="#omit">Omit</a>&lt;<a href="#systembarsinsets">SystemBarsInsets</a>, 'LEFT, RIGHT'&gt;</code> | The inset edge for which to apply the style. Only available on Android. | <code>null</code>    | 8.0.0 |


#### SystemBarsVisibilityOptions

| Prop            | Type                                                                | Description                                                                                         | Default             | Since |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----- |
| **`inset`**     | <code><a href="#systembarsinsets">SystemBarsInsets</a></code>       | The inset edge for which to hide. Only available on Android.                                        | <code>null</code>   | 8.0.0 |
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

Available iOS status bar animations.

<code>'FADE' | 'NONE'</code>


### Enums


#### SystemBarsStyle

| Members       | Value                  | Description                                                                                                                                                                                                    | Since |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`Dark`**    | <code>'DARK'</code>    | Light system bar content on a dark background.                                                                                                                                                                 | 8.0.0 |
| **`Light`**   | <code>'LIGHT'</code>   | For dark system bar content on a light background.                                                                                                                                                             | 8.0.0 |
| **`Default`** | <code>'DEFAULT'</code> | The style is based on the device appearance or the underlying content. If the device is using Dark mode, the statusbar text will be light. If the device is using Light mode, the statusbar text will be dark. | 8.0.0 |

</docgen-api>
