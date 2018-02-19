# Custom Native iOS Code

Many apps will want to add custom Swift (or Objective-C) code to implement native features, without the overhead of building and publishing a proper Capacitor plugin.

We strongly recommend using Swift to build plugins, as the iOS ecosystem has embraced Swift and you'll be able to find help and developers more easily, but Objective-C works just as well.

There are two ways to add custom code depending on whether or not you need to access that code from the WebView:


## WebView Accessible Native Code

The easiest way to build custom native code that needs to be accessible in the WebView is to build
a local Capacitor plugin for it. In this case, building the plugin is as simple as building a new class
and registering it with Capacitor.

`MyPlugin.swift`

```swift
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

Finally, register the plugin by creating a corresponding `MyPlugin.m` Objective-C file and using the Capacitor plugin macros:

```objc
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(MyPlugin, "MyPlugin",
  CAP_PLUGIN_METHOD(echo, CAPPluginReturnPromise);
)
```

This makes `MyPlugin`, and the `echo` method available to the Capacitor web runtime.

## Private Native Code

If your code doens't need to be accessible from the WebView, then simply add your code anywhere it needs to go. With Capacitor, you have full
control over your native project.

Need to add a new event handler in `AppDelegate`? Just add it! Capacitor won't touch your code.
