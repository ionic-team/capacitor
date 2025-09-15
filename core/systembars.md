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

Style of the text of the status bar.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarsstyleoptions">SystemBarsStyleOptions</a></code> |

**Since:** 8.0.0

--------------------


### setHidden(...)

```typescript
setHidden(options: SystemBarsHiddenOptions) => Promise<void>
```

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#systembarshiddenoptions">SystemBarsHiddenOptions</a></code> |

--------------------


### Interfaces


#### SystemBarsStyleOptions

| Prop        | Type                                                      |
| ----------- | --------------------------------------------------------- |
| **`style`** | <code><a href="#systembarstyle">SystemBarStyle</a></code> |


#### SystemBarsHiddenOptions

| Prop         | Type                 |
| ------------ | -------------------- |
| **`hidden`** | <code>boolean</code> |


### Type Aliases


#### SystemBarStyle

****** SYSTEM BARS PLUGIN *******

<code>'DARK' | 'LIGHT'</code>

</docgen-api>
