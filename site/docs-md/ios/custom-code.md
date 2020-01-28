---
title: Custom Native iOS Code
description: Custom Native iOS Code
url: /docs/ios/custom-code
contributors:
  - dotnetkow
  - mlynch
---

# Custom Native iOS Code

<p class="intro">Many apps will want to add custom Swift (or Objective-C) code to implement native features, without the overhead of building and publishing a proper Capacitor plugin.</p>

<p class="intro">We strongly recommend using Swift to build plugins, as the iOS ecosystem has embraced Swift and you'll be able to find help and developers more easily, but Objective-C works just as well.</p>

<p class="intro">There are two ways to add custom code depending on whether or not you need to access that code from the WebView:</p>


## WebView Accessible Native Code

The easiest way to build custom native code that needs to be accessible in the WebView is to build
a local Capacitor plugin for it. In this case, building the plugin is as simple as building a new class
and registering it with Capacitor.

`MyPlugin.swift`

```swift
import Capacitor

@objc(MyPlugin)
public class MyPlugin: CAPPlugin {
  @objc func echo(_ call: CAPPluginCall) {
    let value = call.getString("value") ?? ""
    call.success([
        "value": value
    ])
  }
}
```

The `@objc` decorators are required to make sure Capacitor's runtime (which must use Obj-C for dynamic plugin support) can see it.

Next, you'll need to create a new Objective-C file (with a `.m` extension, _not_ `.h`!) corresponding to your plugin (such as `MyPlugin.m`). Important: you _must_ use the New File dialog in Xcode to do this. You'll then be prompted by Xcode to create a Bridging Header, which you should do.

Finally, register the plugin by adding the required Capacitor plugin macros into your new `.m` file:

```objectivec
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(MyPlugin, "MyPlugin",
  CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
)
```

This makes `MyPlugin`, and the `echo` method available to the Capacitor web runtime like this:

```javascript
import { Plugins } from "@capacitor/core"
const { MyPlugin } = Plugins

const result = await MyPlugin.echo({ value: "Hello World!" })
console.log(result.value)
```

## Private Native Code

If your code doesn't need to be accessible from the WebView, then simply add your code anywhere it needs to go. With Capacitor, you have full
control over your native project.

Need to add a new event handler in `AppDelegate`? Just add it! Capacitor won't touch your code.
