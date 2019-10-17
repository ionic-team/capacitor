---
title: Capacitor Android Plugin Guide
description: Capacitor Android Plugin Guide
url: /docs/plugins/android
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor Android Plugin Guide

<p class="intro">Building Capacitor plugins for Android involves writing Java to interface with Android SDKs.</p>

<p class="intro">Capacitor embraces standard Android development tools for building Android plugins. We believe that using Java directly will make it easier to use existing solutions on Stack Overflow, share work with existing native developers, and use platform features as soon as they are made available.</p>

## Getting Started

To get started, first generate a plugin as shown in the [Getting Started](./#getting-started) section of the Plugin guide.

Next, open `your-plugin/android/` in Android Studio. You then want to navigate to the `.java` file for your plugin, which changes depending on the Plugin ID and Plugin Class Name you used when creating the plugin.

For example, for a plugin with the ID `com.domain.myplugin` and the Plugin Class Name `MyPlugin`, you would find the `.java` file at `android/src/main/java/com/domain/myplugin/MyPlugin.java`.

## Building your Plugin

A Capacitor plugin for Android is a simple Java class that extends `com.getcapacitor.Plugin` and have a `@NativePlugin` annotation.
It has some methods with `@PluginMethod()` annotation that will be callable from JavaScript.

Once your plugin is generated, you can start editing it by opening the file with the Plugin class name you choose on the generator.

### Simple Example

In the generated example, there is a simple echo plugin with an `echo` function that simply returns a value that it was given.

This example demonstrates a couple core components of Capacitor plugins: receiving data from a Plugin Call, and returning data back to the caller.

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

> In order to make Capacitor aware of your plugin, you have to [export it to capacitor](#export-to-capacitor) in your apps `MainActivity`.

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

### Presenting Native Screens

To present a Native Screen over the Capacitor screen we will use [Android's Intents](https://developer.android.com/guide/components/intents-filters). Intents allow you to start an activity from your app, or from another app. [See Common Intents](https://developer.android.com/guide/components/intents-common)

#### Intents without Result(s)

Most times you just want to present the native Activity,
in this case you can just trigger the [relevant action](https://developer.android.com/guide/components/intents-common).

```java
Intent intent = new Intent(Intent.ACTION_VIEW);
getActivity().startActivity(intent);
```

#### Intents with Result(s)

Sometimes when you launch an Intent, you expect some result back. In that case you want to use `startActivityForResult`.

Also make sure you call `saveCall(call);` as you will need it later when handling the intents result.

You also have to register your intents [unique request](https://developer.android.com/training/basics/intents/result#StartActivity) code with `@NativePlugin` in order for
`handleOnActivityResult` to be triggered.

```java
@NativePlugin(
  requestCodes={MyPlugin.REQUEST_IMAGE_PICK} // register request code(s) for intent results
)
class ImagePicker extends Plugin {
  protected static final int REQUEST_IMAGE_PICK = 12345; // Unique request code

  @PluginMethod()
  public void pickImage(PluginCall call) {
    saveCall(call);

    Intent intent = new Intent(Intent.ACTION_PICK);
    intent.setType("image/*");

    startActivityForResult(call, intent, REQUEST_IMAGE_PICK);
  }

  // in order to handle the intents result, you have to @Override handleOnActivityResult
  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);

    // Get the previously saved call
    PluginCall savedCall = getSavedCall();

    if (savedCall == null) {
      return;
    }
    if (requestCode == REQUEST_IMAGE_PICK) {
      // Do something with the data
    }
  }
}
```

### Events

Capacitor Plugins can emit App events and Plugin events

#### App Events

App Events are regular javascript events, like `window` or `document` events.

Capacitor provides all this functions to fire events:

```java
//If you want to provide the target
bridge.triggerJSEvent("myCustomEvent", "window");

bridge.triggerJSEvent("myCustomEvent", "document", "{ 'dataKey': 'dataValue' }");

// Window Events
bridge.triggerWindowJSEvent("myCustomEvent");

bridge.triggerWindowJSEvent("myCustomEvent", "{ 'dataKey': 'dataValue' }");

// Document events
bridge.triggerDocumentJSEvent("myCustomEvent");

bridge.triggerDocumentJSEvent("myCustomEvent",  "{ 'dataKey': 'dataValue' }");
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
Plugins.MyPlugin.addListener("myPluginEvent", (info: any) => {
  console.log("myPluginEvent was fired");
});
```

To emit the event from the Java plugin class you can do it like this:

```java
JSObject ret = new JSObject();
ret.put("value", "some value");
notifyListeners("myPluginEvent", ret);
```

To remove a listener from the plugin object:

```javascript
const myPluginEventListener = Plugins.MyPlugin.addListener("myPluginEvent", (info: any) => {
  console.log("myPluginEvent was fired");
});

myPluginEventListener.remove();
```

### Permissions

Some Plugins will require you to request permissions.
Capacitor provides some helpers to do that.

First declare your plugin permissions in the `@NativePlugin` annotation

```java
@NativePlugin(
  permissions={
    Manifest.permission.ACCESS_NETWORK_STATE
  }
)
```

You can check if all the required permissions has been granted with `hasRequiredPermissions()`.
You can request all permissions with `pluginRequestAllPermissions();`.
You can request for a single permission with `pluginRequestPermission(Manifest.permission.CAMERA, 12345);`
Or you can request a group of permissions with:

```java
static final int REQUEST_IMAGE_CAPTURE = 12345;
pluginRequestPermissions(new String[] {
  Manifest.permission.CAMERA,
  Manifest.permission.WRITE_EXTERNAL_STORAGE,
  Manifest.permission.READ_EXTERNAL_STORAGE
}, REQUEST_IMAGE_CAPTURE);
```

To handle the permission request you have to Override `handleRequestPermissionsResult`

```java
@Override
protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
  super.handleRequestPermissionsResult(requestCode, permissions, grantResults);

  log("handling request perms result");
  PluginCall savedCall = getSavedCall();
  if (savedCall == null) {
    log("No stored plugin call for permissions request result");
    return;
  }

  for(int result : grantResults) {
    if (result == PackageManager.PERMISSION_DENIED) {
      savedCall.error("User denied permission");
      return;
    }
  }

  if (requestCode == REQUEST_IMAGE_CAPTURE) {
    // We got the permission
  }
}
```

### Export to Capacitor

By using the `@NativePlugin` and `@PluginMethod()` annotations in your plugins, you make them available to Capacitor, but you still need an extra step in your application to make Capacitor aware of the plugins.

This is done in your apps `MainActivity`, where you `add` it in e.g. `src/main/java/com/example/myapp/MainActivity.java` like so:

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
