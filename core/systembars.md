# SystemBars

## API

<docgen-index>

* [`setStyle(...)`](#setstyle)
* [`setHidden(...)`](#sethidden)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

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


### Interfaces


#### SystemBarsStyleOptions

| Prop        | Type                                                        | Description                                  | Default              | Since |
| ----------- | ----------------------------------------------------------- | -------------------------------------------- | -------------------- | ----- |
| **`style`** | <code><a href="#systembarstyle">SystemBarStyle</a></code>   | Style of the text of the status bar.         | <code>default</code> | 8.0.0 |
| **`inset`** | <code><a href="#systembarinsets">SystemBarInsets</a></code> | The inset edge for which to apply the style. | <code>null</code>    | 8.0.0 |


#### SystemBarsHiddenOptions

| Prop         | Type                                                        | Description                       | Default           | Since |
| ------------ | ----------------------------------------------------------- | --------------------------------- | ----------------- | ----- |
| **`hidden`** | <code>boolean</code>                                        |                                   |                   |       |
| **`inset`**  | <code><a href="#systembarinsets">SystemBarInsets</a></code> | The inset edge for which to hide. | <code>null</code> | 8.0.0 |


### Type Aliases


#### SystemBarStyle

Available status bar styles.

<code>'DARK' | 'LIGHT'</code>


#### SystemBarInsets

Available inset edges.

<code>'top' | 'bottom' | 'left' | 'right'</code>

</docgen-api>
