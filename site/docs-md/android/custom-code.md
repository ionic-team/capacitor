---
title: Custom Native Android Code
description: Custom Native Android Code
url: /docs/android/custom-code
contributors:
  - mlynch
  - jcesarmobile
  - RoderickQiu
---

# Custom Native Android Code

<p class="intro">Many apps will want to add custom Java code to implement native features, without the overhead of building and publishing a proper Capacitor plugin.</a>

<p class="intro">There are two ways to do this depending on whether or not you need to access that code from the WebView:</a>

## WebView Accessible Native Code

The easiest way to build custom native code that needs to be accessible in the WebView is to build
a local Capacitor plugin for it. In this case, building the plugin is as simple as building a class
that inherits from `com.getcapacitor.Plugin` and uses the `@NativePlugin()` and `@PluginMethod()` annotations.

Here is a simple example: 

`com/example/myapp/CustomNativePlugin.java` in `android/app/src/main/java`:

```java
package com.example.myapp;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class CustomNativePlugin extends Plugin {

  @PluginMethod()
  public void customCall(PluginCall call) {
    String message = call.getString("message");
    // More code here...
    call.success();
  }
  
  @PluginMethod()
  public void customFunction(PluginCall call) {
    // More code here...
    call.resolve();
  }
}
```

Finally, register the plugin in your Activity:

```java
// Other imports...
import com.example.myapp.CustomNativePlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(CustomNativePlugin.class);
    }});
  }
}
```

Then you can use your functions in your webView code:

```javascript
// Other codes...
import { Plugins } from "@capacitor/core";
const { CustomNativePlugin } = Plugins;
// Other codes...
CustomNativePlugin.customCall({ message: "CUSTOM MESSAGE" });
CustomNativePlugin.customFunction();
// Other codes...
```

For more usages of plugin APIs, have a look at [Capacitor Android Plugin Guide](https://capacitor.ionicframework.com/docs/plugins/android/).

## Private Native Code

If your code doesn't need to be accessible from the WebView, then simply add your code anywhere it needs to go. With Capacitor, you have full
control over your native project. Need to add a new event handler in your Activity? Just update `MainActivity` and add it. The world is truly your oyster.
