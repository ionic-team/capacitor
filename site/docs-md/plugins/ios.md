---
title: Capacitor iOS Plugin Guide
description: Capacitor iOS Plugin Guide
url: /docs/plugins/ios
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor iOS Plugin Guide

<p class="intro">Building Capacitor plugins for iOS involves writing Swift (or Objective-C) to interface with Apple's iOS SDKs.</p>

<p class="intro">Capacitor embraces standard iOS development tools for building iOS plugins. We believe that using Swift (or, Objective-C) directly will make it easier to use existing solutions on Stack Overflow, share work with existing native developers, and use platform features as soon as they are made available.</p>

## Getting Started

To get started, first generate a plugin as shown in the [Getting Started](/docs/plugins/#getting-started) section of the Plugin guide.

Next, open `your-plugin/ios/Plugin.xcworkspace` in Xcode.

## Building your Plugin in Swift

A Capacitor plugin for iOS is a simple Swift class that extends `CAPPlugin` and
has some exported methods that will be callable from JavaScript.

Once your plugin is generated, you can start editing it by opening `Plugin.swift`.

### Simple Example

 In the generated example, there is a simple echo plugin with an `echo` function that simply returns a value that it was given.

 This example demonstrates a few core components of Capacitor plugins: receiving data from a Plugin Call, and returning
 data back to the caller:

`Plugin.swift`

```swift
import Capacitor

@objc(MyPlugin)
public class MyPlugin: CAPPlugin {
  @objc func echo(_ call: CAPPluginCall) {
    let value = call.getString("value") ?? ""
    call.resolve([
        "value": value
    ])
  }
}
```

### Accessing Called Data

Each plugin method receives an instance of `CAPPluginCall` containing all the information of the plugin method invocation from the client.

A client can send any data that can be JSON serialized, such as numbers, text, booleans, objects, and arrays. This data
is accessible on the `options` field of the call instance, or by using convenience methods such as `getString` or `getObject`.

For example, here is how you'd get data passed to your method:

```swift
@objc func storeContact(_ call: CAPPluginCall) {
  let name = call.getString("yourName") ?? "default name"
  let address = call.getObject("address") ?? [:]
  let isAwesome = call.getBool("isAwesome") ?? false

  guard let id = call.options["id"] as? String else {
    call.reject("Must provide an id")
    return
  }

  // ...

  call.resolve()
}
```

Notice the various ways data can be accessed on the `CAPPluginCall` instance, including how to require
options using `guard`.

### Returning Data Back

A plugin call can succeed or fail. For calls using promises (most common), succeeding corresponds to calling `resolve` on the Promise, and failure calling `reject`. For those using callbacks, a succeeding will call the success callback or the error callback if failing.

The `resolve` method of `CAPPluginCall` takes a dictionary and supports JSON-serializable data types. Here's an example of returning data back to the client:

```swift
call.resolve([
  "added": true,
  "info": [
    "id": id
  ]
])
```

To fail, or reject a call, call `call.reject`, passing an error string and (optionally) an `Error` instance and extra data back:

```swift
call.reject(error.localizedDescription, error, [
  "item1": true
])
```

### Presenting Native Screens

To present a Native Screen over the Capacitor screen we need to acces the Capacitor's View Controller.
To access the Capacitor's View Controller, we have to use the `CAPBridge` object available on `CAPPlugin` class.

We can use the `UIViewController` to present Native View Controllers over it like this:

```swift
DispatchQueue.main.async {
  self.bridge.viewController.present(ourCustomViewController, animated: true, completion: nil)
}
```

Using `DispatchQueue.main.async` makes your view render from the main thread instead of a background thread. Removing this can cause unexpected results.

On iPad devices you can also present `UIPopovers`, to do so, we provide a helper function to show it centered.

```swift
self.setCenteredPopover(ourCustomViewController)
self.bridge.viewController.present(ourCustomViewController, animated: true, completion: nil)
```

### Events

Capacitor Plugins can emit App events and Plugin events

#### App Events

App Events are regular javascript events, like `window` or `document` events.

Capacitor provides all this functions to fire events:

```swift

//If you want to provide the target
self.bridge.triggerJSEvent(eventName: "myCustomEvent", target: "window")

self.bridge.triggerJSEvent(eventName: "myCustomEvent", target: "document", data: "my custom data")

// Window Events
self.bridge.triggerWindowJSEvent(eventName: "myCustomEvent")

self.bridge.triggerWindowJSEvent(eventName: "myCustomEvent", data: "my custom data")

// Document events
self.bridge.triggerDocumentJSEvent(eventName: "myCustomEvent")

self.bridge.triggerDocumentJSEvent(eventName: "myCustomEvent", data: "my custom data")
```

And to listen for it, just use regular javascript:

```javascript
window.addEventListener("myCustomEvent", function() {
  console.log("myCustomEvent was fired")
});
```

#### Plugin Events

Plugins can emit their own events that you can listen by attaching a listener to the plugin Object like this:

```typescript
Plugins.MyPlugin.addListener('myPluginEvent', (info: any) => {
  console.log('myPluginEvent was fired');
});
```

To emit the event from the Swift plugin class you can do it like this:

`self.notifyListeners("myPluginEvent", data: [:])`

To remove a listener from the plugin object:

```javascript
const myPluginEventListener = Plugins.MyPlugin.addListener("myPluginEvent", (info: any) => {
  console.log("myPluginEvent was fired");
});

myPluginEventListener.remove();
```

### Override navigation

Capacitor plugins can override the webview navigation. For that the plugin can override `- (NSNumber *)shouldOverrideLoad:(WKNavigationAction *)navigationAction` method.
Returning `true` causes the WebView to abort loading the URL.
Returning `false` causes the WebView to continue loading the URL.
Returning `nil` will defer to the default Capacitor policy.

### Export to Capacitor

To make sure Capacitor can see your plugin, you must do two things: export your Swift class to Objective-C, and register it
using the provided Capacitor Objective-C Macros.

To export your Swift class to Objective-C, make sure to add `@objc(YourPluginClass)` above your Swift class, and add `@objc` before any plugin method, as shown above.

To register your plugin with Capacitor, you'll need to create a new Objective-C file (with a `.m` extension, _not_ `.h`!) corresponding to your plugin (such as `MyPlugin.m`) and use the Capacitor macros to register the plugin, and each method that you will use. Important: you _must_ use the New File dialog in Xcode to do this. You'll then be prompted by Xcode to create a Bridging Header, which you _must_ do.

Finally, register the plugin by adding the required Capacitor plugin macros into your new `.m` file:

```objectivec
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(MyPlugin, "MyPlugin",
  CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
)
```

This makes `MyPlugin`, and the `echo` method available to the Capacitor web runtime, indicating to Capacitor that the echo method will return a Promise.
