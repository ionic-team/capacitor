# CapacitorCookies

The Capacitor Cookies API provides native cookie support via patching `document.cookie` to use native libraries. It also provides methods for modifying cookies at a specific url. This plugin is bundled with `@capacitor/core`.

## Configuration

By default, the patching of `document.cookie` to use native libraries is disabled.
If you would like to enable this feature, modify the configuration below in the `capacitor.config` file.

| Prop          | Type                 | Description                                                               | Default            |
| ------------- | -------------------- | ------------------------------------------------------------------------- | ------------------ |
| **`enabled`** | <code>boolean</code> | Enable the patching of `document.cookie` to use native libraries instead. | <code>false</code> |

### Example Configuration

In `capacitor.config.json`:

```json
{
  "plugins": {
    "CapacitorCookies": {
      "enabled": true
    }
  }
}
```

In `capacitor.config.ts`:

```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
```

## Example

```typescript
import { CapacitorCookies } from '@capacitor/core';

const getCookies = () => {
  return document.cookie;
};

const setCookie = () => {
  document.cookie = key + '=' + value;
};

const setCapacitorCookie = async () => {
  await CapacitorCookies.setCookie({
    url: 'http://example.com',
    key: 'language',
    value: 'en',
  });
};

const deleteCookie = async () => {
  await CapacitorCookies.deleteCookie({
    url: 'https://example.com',
    key: 'language',
  });
};

const clearCookiesOnUrl = async () => {
  await CapacitorCookies.clearCookies({
    url: 'https://example.com',
  });
};

const clearAllCookies = async () => {
  await CapacitorCookies.clearAllCookies();
};
```

## Third Party Cookies on iOS

As of iOS 14, you cannot use 3rd party cookies by default. Add the following lines to your Info.plist file to get better support for cookies on iOS. You can add up to 10 domains.

```xml
<key>WKAppBoundDomains</key>
<array>
  <string>www.mydomain.com</string>
  <string>api.mydomain.com</string>
  <string>www.myothercooldomain.com</string>
</array>
```

## API

<docgen-index>

* [`getCookies(...)`](#getcookies)
* [`setCookie(...)`](#setcookie)
* [`deleteCookie(...)`](#deletecookie)
* [`clearCookies(...)`](#clearcookies)
* [`clearAllCookies()`](#clearallcookies)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### getCookies(...)

```typescript
getCookies(options?: GetCookieOptions) => Promise<HttpCookieMap>
```

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#getcookieoptions">GetCookieOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpcookiemap">HttpCookieMap</a>&gt;</code>

--------------------


### setCookie(...)

```typescript
setCookie(options: SetCookieOptions) => Promise<void>
```

Write a cookie to the device.

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#setcookieoptions">SetCookieOptions</a></code> |

--------------------


### deleteCookie(...)

```typescript
deleteCookie(options: DeleteCookieOptions) => Promise<void>
```

Delete a cookie from the device.

| Param         | Type                                                                |
| ------------- | ------------------------------------------------------------------- |
| **`options`** | <code><a href="#deletecookieoptions">DeleteCookieOptions</a></code> |

--------------------


### clearCookies(...)

```typescript
clearCookies(options: ClearCookieOptions) => Promise<void>
```

Clear cookies from the device at a given URL.

| Param         | Type                                                              |
| ------------- | ----------------------------------------------------------------- |
| **`options`** | <code><a href="#clearcookieoptions">ClearCookieOptions</a></code> |

--------------------


### clearAllCookies()

```typescript
clearAllCookies() => Promise<void>
```

Clear all cookies on the device.

--------------------


### Interfaces


#### HttpCookieMap


#### HttpCookie

| Prop        | Type                | Description              |
| ----------- | ------------------- | ------------------------ |
| **`url`**   | <code>string</code> | The URL of the cookie.   |
| **`key`**   | <code>string</code> | The key of the cookie.   |
| **`value`** | <code>string</code> | The value of the cookie. |


#### HttpCookieExtras

| Prop          | Type                | Description                      |
| ------------- | ------------------- | -------------------------------- |
| **`path`**    | <code>string</code> | The path to write the cookie to. |
| **`expires`** | <code>string</code> | The date to expire the cookie.   |


### Type Aliases


#### GetCookieOptions

<code><a href="#omit">Omit</a>&lt;<a href="#httpcookie">HttpCookie</a>, 'key' | 'value'&gt;</code>


#### Omit

Construct a type with the properties of T except for those in type K.

<code><a href="#pick">Pick</a>&lt;T, <a href="#exclude">Exclude</a>&lt;keyof T, K&gt;&gt;</code>


#### Pick

From T, pick a set of properties whose keys are in the union K

<code>{ [P in K]: T[P]; }</code>


#### Exclude

<a href="#exclude">Exclude</a> from T those types that are assignable to U

<code>T extends U ? never : T</code>


#### SetCookieOptions

<code><a href="#httpcookie">HttpCookie</a> & <a href="#httpcookieextras">HttpCookieExtras</a></code>


#### DeleteCookieOptions

<code><a href="#omit">Omit</a>&lt;<a href="#httpcookie">HttpCookie</a>, 'value'&gt;</code>


#### ClearCookieOptions

<code><a href="#omit">Omit</a>&lt;<a href="#httpcookie">HttpCookie</a>, 'key' | 'value'&gt;</code>

</docgen-api>