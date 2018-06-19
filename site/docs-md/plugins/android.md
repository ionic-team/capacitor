# Capacitor Android Plugin Guide

Building Capacitor plugins for Android involves writing Java to interface with Android SDKs.

Capacitor embraces standard Android development tools for building Android plugins. We believe that using Java directly will make it easier to use existing solutions on Stack Overflow, share work with existing native developers, and use platform features as soon as they are made available.

## Getting Started

To get started, first generate a plugin as shown in the [Getting Started](./#getting-started) section of the Plugin guide.

Next, open `your-plugin/android/your-plugin` in Android Studio.

## Building your Plugin

A Capacitor plugin for Android is a simple Java class that extends `com.getcapacitor.Plugin` and have a `@NativePlugin` annotation.
It has some methods with `@PluginMethod()` annotation that will be callable from JavaScript.

Once your plugin is generated, you can start editing it by opening the file with the Plugin class name you choose on the generator.

### Simple Example

In the generated example, there is a simple echo plugin with an `echo` function that simply returns a value that it was given.

This example demonstrates a few core components of Capacitor plugins: receiving data from a Plugin Call, and returning data back to the caller:

`EchoPlugin.java`

```java
package android.plugin.test;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class EchoPlugin extends Plugin {

    @PluginMethod()
    public void echo(PluginCall call) {
        String value = call.getString("value");

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
    }
}
```

### Accessing Called Data

Each plugin method receives an instance of `com.getcapacitor.PluginCall` containing all the information of the plugin method invocation from the client.

A client can send any data that can be JSON serialized, such as numbers, text, booleans, objects, and arrays. This data
is accessible on the `getData` field of the call instance, or by using convenience methods such as `getString` or `getObject`.

For example, here is how you'd get data passed to your method:

```java
@PluginMethod()
public void storeContact(PluginCall call) {
  String name = call.getString("yourName", "default name");
  JSObject address = call.getObject("address", new JSObject());
  boolean isAwesome = call.getBoolean("isAwesome", false);

  if (!call.getData().has("id")) {
    call.reject("Must provide an id");
    return;
  }
  // ...

  call.resolve();
}
```

Notice the various ways data can be accessed on the `PluginCall` instance, including how to check for a key using `getData`'s `has` method.

### Returning Data Back

A plugin call can succeed or fail. For calls using promises (most common), succeeding corresponds to calling `resolve` on the Promise, and failure calling `reject`. For those using callbacks, a succeeding will call the success callback or the error callback if failing.

The `resolve` method of `PluginCall` takes a `JSObject` and supports JSON-serializable data types. Here's an example of returning data back to the client:

```java
JSObject ret = new JSObject();
ret.put("added", true);
JSObject info = new JSObject();
info.put("id", "unique-id-1234");
ret.put("info", info);
call.resolve(ret);
```

To fail, or reject a call, use `call.reject`, passing an error string and (optionally) an `Exception` instance

```java
call.reject(exception.getLocalizedMessage(), exception);
```

### Export to Capacitor

By using the `@NativePlugin` and `@PluginMethod()` annotations in your plugins, you make them available to Capacitor, but you still need an extra step, you have to register your plugin's class in your Acitivity so Capacitor is aware of it:

To register the plugin in your Activity:

```java
// Other imports...
import com.example.myapp.EchoPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
      add(EchoPlugin.class);
    }});
  }
}
```