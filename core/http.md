# CapacitorHttp

The Capacitor Http API provides native http support via patching `fetch` and `XMLHttpRequest` to use native libraries. It also provides helper methods for native http requests without the use of `fetch` and `XMLHttpRequest`. This plugin is bundled with `@capacitor/core`.

## Configuration

By default, the patching of `window.fetch` and `XMLHttpRequest` to use native libraries is disabled.
If you would like to enable this feature, modify the configuration below in the `capacitor.config` file.

| Prop          | Type                 | Description                                                                          | Default            |
| ------------- | -------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| **`enabled`** | <code>boolean</code> | Enable the patching of `fetch` and `XMLHttpRequest` to use native libraries instead. | <code>false</code> |

### Example Configuration

In `capacitor.config.json`:

```json
{
  "plugins": {
    "CapacitorHttp": {
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
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
```

## Example

```typescript
import { CapacitorHttp } from '@capacitor/core';

// Example of a GET request
const doGet = () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Fake-Value' },
    params: { size: 'XL' },
  };

  const response: HttpResponse = await CapacitorHttp.get(options);

  // or...
  // const response = await CapacitorHttp.request({ ...options, method: 'GET' })
};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: { 'X-Fake-Header': 'Fake-Value' },
    data: { foo: 'bar' },
  };

  const response: HttpResponse = await CapacitorHttp.post(options);

  // or...
  // const response = await CapacitorHttp.request({ ...options, method: 'POST' })
};
```

## Large File Support

Due to the nature of the bridge, parsing and transferring large amount of data from native to the web can cause issues. Support for downloading and uploading files has been added to the [`@capacitor/file-transfer`](https://capacitorjs.com/docs/apis/file-transfer) plugin. In many cases, you may also need [`@capacitor/filesystem`](https://capacitorjs.com/docs/apis/filesystem) to generate a valid [file URI](https://capacitorjs.com/docs/apis/filesystem#geturi).

## API

<docgen-index>

* [`request(...)`](#request)
* [`get(...)`](#get)
* [`post(...)`](#post)
* [`put(...)`](#put)
* [`patch(...)`](#patch)
* [`delete(...)`](#delete)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

****** HTTP PLUGIN *******

### request(...)

```typescript
request(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### get(...)

```typescript
get(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http GET Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### post(...)

```typescript
post(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http POST Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### put(...)

```typescript
put(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http PUT Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### patch(...)

```typescript
patch(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http PATCH Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### delete(...)

```typescript
delete(options: HttpOptions) => Promise<HttpResponse>
```

Make a Http DELETE Request to a server using native libraries.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#httpoptions">HttpOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#httpresponse">HttpResponse</a>&gt;</code>

--------------------


### Interfaces


#### HttpResponse

| Prop          | Type                                                | Description                                       |
| ------------- | --------------------------------------------------- | ------------------------------------------------- |
| **`data`**    | <code>any</code>                                    | Additional data received with the Http response.  |
| **`status`**  | <code>number</code>                                 | The status code received from the Http response.  |
| **`headers`** | <code><a href="#httpheaders">HttpHeaders</a></code> | The headers received from the Http response.      |
| **`url`**     | <code>string</code>                                 | The response URL received from the Http response. |


#### HttpHeaders


#### HttpOptions

| Prop                        | Type                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`url`**                   | <code>string</code>                                           | The URL to send the request to.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **`method`**                | <code>string</code>                                           | The Http Request method to run. (Default is GET)                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`params`**                | <code><a href="#httpparams">HttpParams</a></code>             | URL parameters to append to the request.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **`data`**                  | <code>any</code>                                              | Note: On Android and iOS, data can only be a string or a JSON. FormData, <a href="#blob">Blob</a>, <a href="#arraybuffer">ArrayBuffer</a>, and other complex types are only directly supported on web or through enabling `CapacitorHttp` in the config and using the patched `window.fetch` or `XMLHttpRequest`. If you need to send a complex type, you should serialize the data to base64 and set the `headers["Content-Type"]` and `dataType` attributes accordingly. |
| **`headers`**               | <code><a href="#httpheaders">HttpHeaders</a></code>           | Http Request headers to send with the request.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **`readTimeout`**           | <code>number</code>                                           | How long to wait to read additional data in milliseconds. Resets each time new data is received.                                                                                                                                                                                                                                                                                                                                                                           |
| **`connectTimeout`**        | <code>number</code>                                           | How long to wait for the initial connection in milliseconds.                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`disableRedirects`**      | <code>boolean</code>                                          | Sets whether automatic HTTP redirects should be disabled                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **`webFetchExtra`**         | <code><a href="#requestinit">RequestInit</a></code>           | Extra arguments for fetch when running on the web                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **`responseType`**          | <code><a href="#httpresponsetype">HttpResponseType</a></code> | This is used to parse the response appropriately before returning it to the requestee. If the response content-type is "json", this value is ignored.                                                                                                                                                                                                                                                                                                                      |
| **`shouldEncodeUrlParams`** | <code>boolean</code>                                          | Use this option if you need to keep the URL unencoded in certain cases (already encoded, azure/firebase testing, etc.). The default is _true_.                                                                                                                                                                                                                                                                                                                             |
| **`dataType`**              | <code>'file' \| 'formData'</code>                             | This is used if we've had to convert the data from a JS type that needs special handling in the native layer                                                                                                                                                                                                                                                                                                                                                               |


#### HttpParams


#### RequestInit

| Prop                 | Type                                                              | Description                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`body`**           | <code><a href="#bodyinit">BodyInit</a></code>                     | A <a href="#bodyinit">BodyInit</a> object or null to set request's body.                                                                                                          |
| **`cache`**          | <code><a href="#requestcache">RequestCache</a></code>             | A string indicating how the request will interact with the browser's cache to set request's cache.                                                                                |
| **`credentials`**    | <code><a href="#requestcredentials">RequestCredentials</a></code> | A string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL. Sets request's credentials.                          |
| **`headers`**        | <code><a href="#headersinit">HeadersInit</a></code>               | A <a href="#headers">Headers</a> object, an object literal, or an array of two-item arrays to set request's headers.                                                              |
| **`integrity`**      | <code>string</code>                                               | A cryptographic hash of the resource to be fetched by request. Sets request's integrity.                                                                                          |
| **`keepalive`**      | <code>boolean</code>                                              | A boolean to set request's keepalive.                                                                                                                                             |
| **`method`**         | <code>string</code>                                               | A string to set request's method.                                                                                                                                                 |
| **`mode`**           | <code><a href="#requestmode">RequestMode</a></code>               | A string to indicate whether the request will use CORS, or will be restricted to same-origin URLs. Sets request's mode.                                                           |
| **`redirect`**       | <code><a href="#requestredirect">RequestRedirect</a></code>       | A string indicating whether request follows redirects, results in an error upon encountering a redirect, or returns the redirect (in an opaque fashion). Sets request's redirect. |
| **`referrer`**       | <code>string</code>                                               | A string whose value is a same-origin URL, "about:client", or the empty string, to set request's referrer.                                                                        |
| **`referrerPolicy`** | <code><a href="#referrerpolicy">ReferrerPolicy</a></code>         | A referrer policy to set request's referrerPolicy.                                                                                                                                |
| **`signal`**         | <code><a href="#abortsignal">AbortSignal</a></code>               | An <a href="#abortsignal">AbortSignal</a> to set request's signal.                                                                                                                |
| **`window`**         | <code>any</code>                                                  | Can only be null. Used to disassociate request from any Window.                                                                                                                   |


#### Blob

A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The <a href="#file">File</a> interface is based on <a href="#blob">Blob</a>, inheriting blob functionality and expanding it to support files on the user's system.
`Blob` class is a global reference for `require('node:buffer').Blob`
https://nodejs.org/api/buffer.html#class-blob

| Prop       | Type                |
| ---------- | ------------------- |
| **`size`** | <code>number</code> |
| **`type`** | <code>string</code> |

| Method          | Signature                                                                           |
| --------------- | ----------------------------------------------------------------------------------- |
| **arrayBuffer** | () =&gt; Promise&lt;<a href="#arraybuffer">ArrayBuffer</a>&gt;                      |
| **slice**       | (start?: number, end?: number, contentType?: string) =&gt; <a href="#blob">Blob</a> |
| **stream**      | () =&gt; <a href="#readablestream">ReadableStream</a>                               |
| **text**        | () =&gt; Promise&lt;string&gt;                                                      |


#### ArrayBuffer

Represents a raw buffer of binary data, which is used to store data for the
different typed arrays. ArrayBuffers cannot be read from or written to directly,
but can be passed to a typed array or DataView Object to interpret the raw
buffer as needed.

| Prop             | Type                | Description                                                                     |
| ---------------- | ------------------- | ------------------------------------------------------------------------------- |
| **`byteLength`** | <code>number</code> | Read-only. The length of the <a href="#arraybuffer">ArrayBuffer</a> (in bytes). |

| Method    | Signature                                                                  | Description                                                     |
| --------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **slice** | (begin: number, end?: number) =&gt; <a href="#arraybuffer">ArrayBuffer</a> | Returns a section of an <a href="#arraybuffer">ArrayBuffer</a>. |


#### ReadableStream

This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a <a href="#readablestream">ReadableStream</a> through the body property of a Response object.

| Prop         | Type                 |
| ------------ | -------------------- |
| **`locked`** | <code>boolean</code> |

| Method          | Signature                                                                                                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cancel**      | (reason?: any) =&gt; Promise&lt;void&gt;                                                                                                                                                                             |
| **getReader**   | () =&gt; <a href="#readablestreamdefaultreader">ReadableStreamDefaultReader</a>&lt;R&gt;                                                                                                                             |
| **pipeThrough** | &lt;T&gt;(transform: <a href="#readablewritablepair">ReadableWritablePair</a>&lt;T, R&gt;, options?: <a href="#streampipeoptions">StreamPipeOptions</a>) =&gt; <a href="#readablestream">ReadableStream</a>&lt;T&gt; |
| **pipeTo**      | (dest: <a href="#writablestream">WritableStream</a>&lt;R&gt;, options?: <a href="#streampipeoptions">StreamPipeOptions</a>) =&gt; Promise&lt;void&gt;                                                                |
| **tee**         | () =&gt; [ReadableStream&lt;R&gt;, <a href="#readablestream">ReadableStream</a>&lt;R&gt;]                                                                                                                            |


#### ReadableStreamDefaultReader

| Method          | Signature                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| **read**        | () =&gt; Promise&lt;<a href="#readablestreamdefaultreadresult">ReadableStreamDefaultReadResult</a>&lt;R&gt;&gt; |
| **releaseLock** | () =&gt; void                                                                                                   |


#### ReadableStreamDefaultReadValueResult

| Prop        | Type               |
| ----------- | ------------------ |
| **`done`**  | <code>false</code> |
| **`value`** | <code>T</code>     |


#### ReadableStreamDefaultReadDoneResult

| Prop        | Type              |
| ----------- | ----------------- |
| **`done`**  | <code>true</code> |
| **`value`** |                   |


#### ReadableWritablePair

| Prop           | Type                                                               | Description                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`readable`** | <code><a href="#readablestream">ReadableStream</a>&lt;R&gt;</code> |                                                                                                                                                                                                                                                                                                                                                                                     |
| **`writable`** | <code><a href="#writablestream">WritableStream</a>&lt;W&gt;</code> | Provides a convenient, chainable way of piping this readable stream through a transform stream (or any other { writable, readable } pair). It simply pipes the stream into the writable side of the supplied pair, and returns the readable side for further use. Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader. |


#### WritableStream

This Streams API interface provides a standard abstraction for writing streaming data to a destination, known as a sink. This object comes with built-in backpressure and queuing.

| Prop         | Type                 |
| ------------ | -------------------- |
| **`locked`** | <code>boolean</code> |

| Method        | Signature                                                                                |
| ------------- | ---------------------------------------------------------------------------------------- |
| **abort**     | (reason?: any) =&gt; Promise&lt;void&gt;                                                 |
| **getWriter** | () =&gt; <a href="#writablestreamdefaultwriter">WritableStreamDefaultWriter</a>&lt;W&gt; |


#### WritableStreamDefaultWriter

This Streams API interface is the object returned by <a href="#writablestream">WritableStream.getWriter</a>() and once created locks the &lt; writer to the <a href="#writablestream">WritableStream</a> ensuring that no other streams can write to the underlying sink.

| Prop              | Type                                  |
| ----------------- | ------------------------------------- |
| **`closed`**      | <code>Promise&lt;undefined&gt;</code> |
| **`desiredSize`** | <code>number</code>                   |
| **`ready`**       | <code>Promise&lt;undefined&gt;</code> |

| Method          | Signature                                |
| --------------- | ---------------------------------------- |
| **abort**       | (reason?: any) =&gt; Promise&lt;void&gt; |
| **close**       | () =&gt; Promise&lt;void&gt;             |
| **releaseLock** | () =&gt; void                            |
| **write**       | (chunk: W) =&gt; Promise&lt;void&gt;     |


#### StreamPipeOptions

| Prop                | Type                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`preventAbort`**  | <code>boolean</code>                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`preventCancel`** | <code>boolean</code>                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`preventClose`**  | <code>boolean</code>                                | Pipes this readable stream to a given writable stream destination. The way in which the piping process behaves under various error conditions can be customized with a number of passed options. It returns a promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered. Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader. Errors and closures of the source and destination streams propagate as follows: An error in this source readable stream will abort destination, unless preventAbort is truthy. The returned promise will be rejected with the source's error, or with any error that occurs during aborting the destination. An error in destination will cancel this source readable stream, unless preventCancel is truthy. The returned promise will be rejected with the destination's error, or with any error that occurs during canceling the source. When this source readable stream closes, destination will be closed, unless preventClose is truthy. The returned promise will be fulfilled once this process completes, unless an error is encountered while closing the destination, in which case it will be rejected with that error. If destination starts out closed or closing, this source readable stream will be canceled, unless preventCancel is true. The returned promise will be rejected with an error indicating piping to a closed stream failed, or with any error that occurs during canceling the source. The signal option can be set to an <a href="#abortsignal">AbortSignal</a> to allow aborting an ongoing pipe operation via the corresponding AbortController. In this case, this source readable stream will be canceled, and destination aborted, unless the respective options preventCancel or preventAbort are set. |
| **`signal`**        | <code><a href="#abortsignal">AbortSignal</a></code> |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |


#### AbortSignal

A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object.

| Prop          | Type                                                                                                  | Description                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **`aborted`** | <code>boolean</code>                                                                                  | Returns true if this <a href="#abortsignal">AbortSignal</a>'s AbortController has signaled to abort, and false otherwise. |
| **`onabort`** | <code>(this: <a href="#abortsignal">AbortSignal</a>, ev: <a href="#event">Event</a>) =&gt; any</code> |                                                                                                                           |

| Method                  | Signature                                                                                                                                                                                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **addEventListener**    | &lt;K extends "abort"&gt;(type: K, listener: (this: <a href="#abortsignal">AbortSignal</a>, ev: AbortSignalEventMap[K]) =&gt; any, options?: boolean \| <a href="#addeventlisteneroptions">AddEventListenerOptions</a>) =&gt; void | Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched. The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture. When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET. When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners. When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed. The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture. |
| **addEventListener**    | (type: string, listener: <a href="#eventlisteneroreventlistenerobject">EventListenerOrEventListenerObject</a>, options?: boolean \| <a href="#addeventlisteneroptions">AddEventListenerOptions</a>) =&gt; void                     | Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched. The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture. When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET. When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners. When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed. The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture. |
| **removeEventListener** | &lt;K extends "abort"&gt;(type: K, listener: (this: <a href="#abortsignal">AbortSignal</a>, ev: AbortSignalEventMap[K]) =&gt; any, options?: boolean \| <a href="#eventlisteneroptions">EventListenerOptions</a>) =&gt; void       | Removes the event listener in target's event listener list with the same type, callback, and options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **removeEventListener** | (type: string, listener: <a href="#eventlisteneroreventlistenerobject">EventListenerOrEventListenerObject</a>, options?: boolean \| <a href="#eventlisteneroptions">EventListenerOptions</a>) =&gt; void                           | Removes the event listener in target's event listener list with the same type, callback, and options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |


#### AbortSignalEventMap

| Prop          | Type                                    |
| ------------- | --------------------------------------- |
| **`"abort"`** | <code><a href="#event">Event</a></code> |


#### Event

An event which takes place in the DOM.

| Prop                   | Type                                                | Description                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`bubbles`**          | <code>boolean</code>                                | Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.                                                                                                |
| **`cancelBubble`**     | <code>boolean</code>                                |                                                                                                                                                                                                                                                            |
| **`cancelable`**       | <code>boolean</code>                                | Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method. |
| **`composed`**         | <code>boolean</code>                                | Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.                                                                                  |
| **`currentTarget`**    | <code><a href="#eventtarget">EventTarget</a></code> | Returns the object whose event listener's callback is currently being invoked.                                                                                                                                                                             |
| **`defaultPrevented`** | <code>boolean</code>                                | Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.                                                                                                                                                    |
| **`eventPhase`**       | <code>number</code>                                 | Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.                                                                                                                                                           |
| **`isTrusted`**        | <code>boolean</code>                                | Returns true if event was dispatched by the user agent, and false otherwise.                                                                                                                                                                               |
| **`returnValue`**      | <code>boolean</code>                                |                                                                                                                                                                                                                                                            |
| **`srcElement`**       | <code><a href="#eventtarget">EventTarget</a></code> |                                                                                                                                                                                                                                                            |
| **`target`**           | <code><a href="#eventtarget">EventTarget</a></code> | Returns the object to which event is dispatched (its target).                                                                                                                                                                                              |
| **`timeStamp`**        | <code>number</code>                                 | Returns the event's timestamp as the number of milliseconds measured relative to the time origin.                                                                                                                                                          |
| **`type`**             | <code>string</code>                                 | Returns the type of event, e.g. "click", "hashchange", or "submit".                                                                                                                                                                                        |
| **`AT_TARGET`**        | <code>number</code>                                 |                                                                                                                                                                                                                                                            |
| **`BUBBLING_PHASE`**   | <code>number</code>                                 |                                                                                                                                                                                                                                                            |
| **`CAPTURING_PHASE`**  | <code>number</code>                                 |                                                                                                                                                                                                                                                            |
| **`NONE`**             | <code>number</code>                                 |                                                                                                                                                                                                                                                            |

| Method                       | Signature                                                          | Description                                                                                                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **composedPath**             | () =&gt; EventTarget[]                                             | Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget. |
| **initEvent**                | (type: string, bubbles?: boolean, cancelable?: boolean) =&gt; void |                                                                                                                                                                                                                                         |
| **preventDefault**           | () =&gt; void                                                      | If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.               |
| **stopImmediatePropagation** | () =&gt; void                                                      | Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.                            |
| **stopPropagation**          | () =&gt; void                                                      | When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.                                                                                                                 |


#### EventTarget

<a href="#eventtarget">EventTarget</a> is a DOM interface implemented by objects that can receive events and may have listeners for them.
EventTarget is a DOM interface implemented by objects that can
receive events and may have listeners for them.

| Method                  | Signature                                                                                                                                                                                                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **addEventListener**    | (type: string, listener: <a href="#eventlisteneroreventlistenerobject">EventListenerOrEventListenerObject</a> \| null, options?: boolean \| <a href="#addeventlisteneroptions">AddEventListenerOptions</a>) =&gt; void | Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched. The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture. When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET. When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners. When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed. The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture. |
| **dispatchEvent**       | (event: <a href="#event">Event</a>) =&gt; boolean                                                                                                                                                                      | Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **removeEventListener** | (type: string, callback: <a href="#eventlisteneroreventlistenerobject">EventListenerOrEventListenerObject</a> \| null, options?: <a href="#eventlisteneroptions">EventListenerOptions</a> \| boolean) =&gt; void       | Removes the event listener in target's event listener list with the same type, callback, and options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |


#### EventListener


#### EventListenerObject

| Method          | Signature                                    |
| --------------- | -------------------------------------------- |
| **handleEvent** | (evt: <a href="#event">Event</a>) =&gt; void |


#### AddEventListenerOptions

| Prop          | Type                 |
| ------------- | -------------------- |
| **`once`**    | <code>boolean</code> |
| **`passive`** | <code>boolean</code> |


#### EventListenerOptions

| Prop          | Type                 |
| ------------- | -------------------- |
| **`capture`** | <code>boolean</code> |


#### ArrayBufferView

| Prop             | Type                                                        | Description                                                                  |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **`buffer`**     | <code><a href="#arraybufferlike">ArrayBufferLike</a></code> | The <a href="#arraybuffer">ArrayBuffer</a> instance referenced by the array. |
| **`byteLength`** | <code>number</code>                                         | The length in bytes of the array.                                            |
| **`byteOffset`** | <code>number</code>                                         | The offset in bytes of the array.                                            |


#### ArrayBufferTypes

Allowed <a href="#arraybuffer">ArrayBuffer</a> types for the buffer of an <a href="#arraybufferview">ArrayBufferView</a> and related Typed Arrays.

| Prop              | Type                                                |
| ----------------- | --------------------------------------------------- |
| **`ArrayBuffer`** | <code><a href="#arraybuffer">ArrayBuffer</a></code> |


#### FormData

Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".

| Method      | Signature                                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **append**  | (name: string, value: string \| <a href="#blob">Blob</a>, fileName?: string) =&gt; void                                                                                 |
| **delete**  | (name: string) =&gt; void                                                                                                                                               |
| **get**     | (name: string) =&gt; <a href="#formdataentryvalue">FormDataEntryValue</a> \| null                                                                                       |
| **getAll**  | (name: string) =&gt; FormDataEntryValue[]                                                                                                                               |
| **has**     | (name: string) =&gt; boolean                                                                                                                                            |
| **set**     | (name: string, value: string \| <a href="#blob">Blob</a>, fileName?: string) =&gt; void                                                                                 |
| **forEach** | (callbackfn: (value: <a href="#formdataentryvalue">FormDataEntryValue</a>, key: string, parent: <a href="#formdata">FormData</a>) =&gt; void, thisArg?: any) =&gt; void |


#### File

Provides information about files and allows JavaScript in a web page to access their content.

| Prop               | Type                |
| ------------------ | ------------------- |
| **`lastModified`** | <code>number</code> |
| **`name`**         | <code>string</code> |


#### URLSearchParams

<a href="#urlsearchparams">`URLSearchParams`</a> class is a global reference for `require('url').URLSearchParams`
https://nodejs.org/api/url.html#class-urlsearchparams

| Method       | Signature                                                                                                                               | Description                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **append**   | (name: string, value: string) =&gt; void                                                                                                | Appends a specified key/value pair as a new search parameter.                                                              |
| **delete**   | (name: string) =&gt; void                                                                                                               | Deletes the given search parameter, and its associated value, from the list of all search parameters.                      |
| **get**      | (name: string) =&gt; string \| null                                                                                                     | Returns the first value associated to the given search parameter.                                                          |
| **getAll**   | (name: string) =&gt; string[]                                                                                                           | Returns all the values association with a given search parameter.                                                          |
| **has**      | (name: string) =&gt; boolean                                                                                                            | Returns a Boolean indicating if such a search parameter exists.                                                            |
| **set**      | (name: string, value: string) =&gt; void                                                                                                | Sets the value associated to a given search parameter to the given value. If there were several values, delete the others. |
| **sort**     | () =&gt; void                                                                                                                           |                                                                                                                            |
| **toString** | () =&gt; string                                                                                                                         | Returns a string containing a query string suitable for use in a URL. Does not include the question mark.                  |
| **forEach**  | (callbackfn: (value: string, key: string, parent: <a href="#urlsearchparams">URLSearchParams</a>) =&gt; void, thisArg?: any) =&gt; void |                                                                                                                            |


#### Uint8Array

A typed array of 8-bit unsigned integer values. The contents are initialized to 0. If the
requested number of bytes could not be allocated an exception is raised.

| Prop                    | Type                                                        | Description                                                                  |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **`BYTES_PER_ELEMENT`** | <code>number</code>                                         | The size in bytes of each element in the array.                              |
| **`buffer`**            | <code><a href="#arraybufferlike">ArrayBufferLike</a></code> | The <a href="#arraybuffer">ArrayBuffer</a> instance referenced by the array. |
| **`byteLength`**        | <code>number</code>                                         | The length in bytes of the array.                                            |
| **`byteOffset`**        | <code>number</code>                                         | The offset in bytes of the array.                                            |
| **`length`**            | <code>number</code>                                         | The length of the array.                                                     |

| Method             | Signature                                                                                                                                                                      | Description                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **copyWithin**     | (target: number, start: number, end?: number) =&gt; this                                                                                                                       | Returns the this object after copying a section of the array identified by start and end to the same array starting at position target                                                                                                      |
| **every**          | (predicate: (value: number, index: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; unknown, thisArg?: any) =&gt; boolean                                            | Determines whether all the members of an array satisfy the specified test.                                                                                                                                                                  |
| **fill**           | (value: number, start?: number, end?: number) =&gt; this                                                                                                                       | Returns the this object after filling the section identified by start and end with value                                                                                                                                                    |
| **filter**         | (predicate: (value: number, index: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; any, thisArg?: any) =&gt; <a href="#uint8array">Uint8Array</a>                   | Returns the elements of an array that meet the condition specified in a callback function.                                                                                                                                                  |
| **find**           | (predicate: (value: number, index: number, obj: <a href="#uint8array">Uint8Array</a>) =&gt; boolean, thisArg?: any) =&gt; number \| undefined                                  | Returns the value of the first element in the array where predicate is true, and undefined otherwise.                                                                                                                                       |
| **findIndex**      | (predicate: (value: number, index: number, obj: <a href="#uint8array">Uint8Array</a>) =&gt; boolean, thisArg?: any) =&gt; number                                               | Returns the index of the first element in the array where predicate is true, and -1 otherwise.                                                                                                                                              |
| **forEach**        | (callbackfn: (value: number, index: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; void, thisArg?: any) =&gt; void                                                 | Performs the specified action for each element in an array.                                                                                                                                                                                 |
| **indexOf**        | (searchElement: number, fromIndex?: number) =&gt; number                                                                                                                       | Returns the index of the first occurrence of a value in an array.                                                                                                                                                                           |
| **join**           | (separator?: string) =&gt; string                                                                                                                                              | Adds all the elements of an array separated by the specified separator string.                                                                                                                                                              |
| **lastIndexOf**    | (searchElement: number, fromIndex?: number) =&gt; number                                                                                                                       | Returns the index of the last occurrence of a value in an array.                                                                                                                                                                            |
| **map**            | (callbackfn: (value: number, index: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; number, thisArg?: any) =&gt; <a href="#uint8array">Uint8Array</a>               | Calls a defined callback function on each element of an array, and returns an array that contains the results.                                                                                                                              |
| **reduce**         | (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; number) =&gt; number                       | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.                      |
| **reduce**         | (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; number, initialValue: number) =&gt; number |                                                                                                                                                                                                                                             |
| **reduce**         | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; U, initialValue: U) =&gt; U            | Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.                      |
| **reduceRight**    | (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; number) =&gt; number                       | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reduceRight**    | (callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; number, initialValue: number) =&gt; number |                                                                                                                                                                                                                                             |
| **reduceRight**    | &lt;U&gt;(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; U, initialValue: U) =&gt; U            | Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function. |
| **reverse**        | () =&gt; <a href="#uint8array">Uint8Array</a>                                                                                                                                  | Reverses the elements in an Array.                                                                                                                                                                                                          |
| **set**            | (array: <a href="#arraylike">ArrayLike</a>&lt;number&gt;, offset?: number) =&gt; void                                                                                          | Sets a value or an array of values.                                                                                                                                                                                                         |
| **slice**          | (start?: number, end?: number) =&gt; <a href="#uint8array">Uint8Array</a>                                                                                                      | Returns a section of an array.                                                                                                                                                                                                              |
| **some**           | (predicate: (value: number, index: number, array: <a href="#uint8array">Uint8Array</a>) =&gt; unknown, thisArg?: any) =&gt; boolean                                            | Determines whether the specified callback function returns true for any element of an array.                                                                                                                                                |
| **sort**           | (compareFn?: (a: number, b: number) =&gt; number) =&gt; this                                                                                                                   | Sorts an array.                                                                                                                                                                                                                             |
| **subarray**       | (begin?: number, end?: number) =&gt; <a href="#uint8array">Uint8Array</a>                                                                                                      | Gets a new <a href="#uint8array">Uint8Array</a> view of the <a href="#arraybuffer">ArrayBuffer</a> store for this array, referencing the elements at begin, inclusive, up to end, exclusive.                                                |
| **toLocaleString** | () =&gt; string                                                                                                                                                                | Converts a number to a string by using the current locale.                                                                                                                                                                                  |
| **toString**       | () =&gt; string                                                                                                                                                                | Returns a string representation of an array.                                                                                                                                                                                                |
| **valueOf**        | () =&gt; <a href="#uint8array">Uint8Array</a>                                                                                                                                  | Returns the primitive value of the specified object.                                                                                                                                                                                        |


#### ArrayLike

| Prop         | Type                |
| ------------ | ------------------- |
| **`length`** | <code>number</code> |


#### Headers

This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A <a href="#headers">Headers</a> object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence.

| Method      | Signature                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| **append**  | (name: string, value: string) =&gt; void                                                                                |
| **delete**  | (name: string) =&gt; void                                                                                               |
| **get**     | (name: string) =&gt; string \| null                                                                                     |
| **has**     | (name: string) =&gt; boolean                                                                                            |
| **set**     | (name: string, value: string) =&gt; void                                                                                |
| **forEach** | (callbackfn: (value: string, key: string, parent: <a href="#headers">Headers</a>) =&gt; void, thisArg?: any) =&gt; void |


### Type Aliases


#### BodyInit

<code><a href="#blob">Blob</a> | <a href="#buffersource">BufferSource</a> | <a href="#formdata">FormData</a> | <a href="#urlsearchparams">URLSearchParams</a> | <a href="#readablestream">ReadableStream</a>&lt;<a href="#uint8array">Uint8Array</a>&gt; | string</code>


#### ReadableStreamDefaultReadResult

<code><a href="#readablestreamdefaultreadvalueresult">ReadableStreamDefaultReadValueResult</a>&lt;T&gt; | <a href="#readablestreamdefaultreaddoneresult">ReadableStreamDefaultReadDoneResult</a></code>


#### EventListenerOrEventListenerObject

<code><a href="#eventlistener">EventListener</a> | <a href="#eventlistenerobject">EventListenerObject</a></code>


#### BufferSource

<code><a href="#arraybufferview">ArrayBufferView</a> | <a href="#arraybuffer">ArrayBuffer</a></code>


#### ArrayBufferLike

<code>ArrayBufferTypes[keyof ArrayBufferTypes]</code>


#### FormDataEntryValue

<code><a href="#file">File</a> | string</code>


#### RequestCache

<code>"default" | "force-cache" | "no-cache" | "no-store" | "only-if-cached" | "reload"</code>


#### RequestCredentials

<code>"include" | "omit" | "same-origin"</code>


#### HeadersInit

<code><a href="#headers">Headers</a> | string[][] | <a href="#record">Record</a>&lt;string, string&gt;</code>


#### Record

Construct a type with a set of properties K of type T

<code>{ [P in K]: T; }</code>


#### RequestMode

<code>"cors" | "navigate" | "no-cors" | "same-origin"</code>


#### RequestRedirect

<code>"error" | "follow" | "manual"</code>


#### ReferrerPolicy

<code>"" | "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url"</code>


#### HttpResponseType

How to parse the Http response before returning it to the client.

<code>'arraybuffer' | 'blob' | 'json' | 'text' | 'document'</code>

</docgen-api>