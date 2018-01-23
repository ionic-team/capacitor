# Creating Capacitor Plugins

An Capacitor plugin relies on a JavaScript layer that proxies calls to Capacitor's cross-platform runtime which runs
the corresponding native or pure-web code to handle the operation.

Thus, an Capacitor plugin consists of some JavaScript and then a native implementation for each platform that requires it.

Let's implement a simple Todo plugin that stores a list of Todo's in native device storage or web storage depending on the platform available.

## Generate Plugin Scaffolding

To generate a new plugin for development, run

```bash
capacitor plugin:generate com.example.plugin.todo Todo
```

The plugin's structure will look similar to this:


## JavaScript Implementation

## iOS Plugin

```swift
import Capacitor

@objc(Todo)
class Todo : Plugin {
  @objc func create(_ call: PluginCall) {
    // Grab the call arguments, guarding to ensure they exist
    guard let title = call.get("title", String.self) else {
      call.error("Must provide title")
    }

    guard let text = call.get("text", String.self) else {
      call.error("Must provide text")
    }

    // Create the Todo
    let todo = Todo(title, text)

    // Save it somewhere
    // ...

    // Construct a new PluginResult object with the
    // data we'll send back to the client
    let result = [
      "todoId": todo.id
    ]

    // Send the result back to the client
    call.success(result)
  }

  @objc public func update(_ call: PluginCall) {
    // ... exercise for the reader
  }

  @objc public func delete(_ call: PluginCall) {
    // ... exercise for the reader
  }
}
```

## Android Plugin

```java
package com.example.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;

@NativePlugin()
public class Todo extends Plugin {

  @PluginMethod()
  public void create(PluginCall call) {
    String title = call.getString("title");
    String text = call.getString("text");

    Todo t = new Todo(title, text);
    // save it somewhere

    JSObject ret = new JSONObject();
    try {
      ret.put("todoId", t.id);
      call.success(ret);
    } catch(JSONException ex) {
      call.error("Unable to send todo", ex);
    }
  }

}
```

## Web Plugin
