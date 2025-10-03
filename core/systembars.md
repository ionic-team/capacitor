# SystemBars

## API

<docgen-index>

* [`setStyle(...)`](#setstyle)
* [`setHidden(...)`](#sethidden)
* [`setOverlay(...)`](#setoverlay)
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

Set the current style of the status bar.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsstyleoptions">SystemBarsStyleOptions</a></code> |

**Since:** 8.0.0

--------------------


### setHidden(...)

```typescript
setHidden(options: SystemBarsHiddenOptions) => Promise<void>
```

Set the visibility of the status bar.

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarshiddenoptions">SystemBarsHiddenOptions</a></code> |

**Since:** 8.0.0

--------------------


### setOverlay(...)

```typescript
setOverlay(options: SystemBarsOverlayOptions) => Promise<void>
```

| Param         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsoverlayoptions">SystemBarsOverlayOptions</a></code> |

--------------------


### Interfaces


#### SystemBarsStyleOptions

| Prop        | Type                                                                                                       | Description                                  | Default              | Since |
| ----------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------- | ----- |
| **`style`** | <code><a href="#systembarstyle">SystemBarStyle</a></code>                                                  | Style of the text of the status bar.         | <code>default</code> | 8.0.0 |
| **`inset`** | <code><a href="#omit">Omit</a>&lt;<a href="#systembarinsets">SystemBarInsets</a>, 'left, right'&gt;</code> | The inset edge for which to apply the style. | <code>null</code>    | 8.0.0 |


#### SystemBarsHiddenOptions

| Prop         | Type                                                        | Description                       | Default           | Since |
| ------------ | ----------------------------------------------------------- | --------------------------------- | ----------------- | ----- |
| **`hidden`** | <code>boolean</code>                                        |                                   |                   |       |
| **`inset`**  | <code><a href="#systembarinsets">SystemBarInsets</a></code> | The inset edge for which to hide. | <code>null</code> | 8.0.0 |


#### SystemBarsOverlayOptions

| Prop          | Type                 |
| ------------- | -------------------- |
| **`enabled`** | <code>boolean</code> |


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


#### SystemBarInsets

Available inset edges.

<code>'top' | 'bottom' | 'left' | 'right'</code>


### Enums


#### SystemBarStyle

| Members       | Value                  | Description                                                                                                                                                                                                    | Since |
| ------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`Dark`**    | <code>'DARK'</code>    | Light system bar content on a dark background.                                                                                                                                                                 | 8.0.0 |
| **`Light`**   | <code>'LIGHT'</code>   | For dark system bar content on a light background.                                                                                                                                                             | 8.0.0 |
| **`Default`** | <code>'DEFAULT'</code> | The style is based on the device appearance or the underlying content. If the device is using Dark mode, the statusbar text will be light. If the device is using Light mode, the statusbar text will be dark. | 8.0.0 |

</docgen-api>
