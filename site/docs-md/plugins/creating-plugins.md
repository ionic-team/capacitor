# Creating Avocado Plugins

An Avocado plugin relies on a JavaScript layer that proxies calls to Avocado's cross-platform runtime which runs
the corresponding native or pure-web code to handle the operation.

Thus, an Avocado plugin consists of some JavaScript and then a native implementation for each platform that requires it.

Let's implement a simple Todo plugin that stores a list of Todo's in native device storage or web storage depending on the platform available.

## Generate Plugin Scaffolding

To generate a new plugin for development, run

```bash
avocado plugin:generate com.example.plugin.todo Todo
```

The plugin's structure will look similar to this:


## JavaScript Implementation

The JavaScript Implementation using TypeScript will guide the rest of your development. We strongly recommend
utilizing TypeScript types to make your plugin self-documenting, enable users to have rich typing information
when developing, and to use as a reference for expected parameters and return values when developing 
the iOS, Android, and Web implementations of your plugin.

Edit `src/plugin.ts` and add the following:

```typescript
import { NativePlugin } from 'avocado-js';

export interface Todo {
  text: string;
  title: string;
}

@NativePlugin({
  name: 'Todo',
  id: 'avocado-plugin-todo'
})
export class TodoPlugin extends Plugin {
  async create(todo: Todo) : Promise<Todo> {
    return await this.nativePromise('create', {
      todo
    });
  }

  async update(todo: Todo) : Promise<Todo> {
    return await this.nativePromise('update', {
      todo
    });
  }

  async delete(todo: Todo) : Promise<Todo> {
    return await this.nativePromise('delete', {
      todo
    });
  }

  onChange(callback) {
    this.callback('onChange', callback);
  }
}
```

## iOS Plugin

```swift
import Avocado

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
    let result = PluginResult(data: [
      "todoId": todo.id
    ])

    // Send the result back to the client
    call.successCallback(result)
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

import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

@NativePlugin(id="com.example.plugin.todo")
public class Todo extends Plugin {

  @PluginMethod()
  public void create(PluginCall call) {
    String title = call.getString("title");
    String text = call.getString("text");

    Todo t = new Todo(title, text);
    // save it somewhere

    JSONObject ret = new JSONObject();
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

Note: the text below is out of date.

The Web Plugin implements Todo CRUD operations in a pure browser environment, such as a Progressive Web App, that may only have access to standard Web APIs.

Generally, the Web API and the JavaScript API site side-by-side to enforce the importance of web support or sane web fallbacks for plugin operations.

```typescript
import { Plugin, App } from '@avocado/plugin';

import { Todo } from './definitions';

@PluginWeb({
  name: 'Todo',
  id: 'avocado-plugin-todo'
})
export class Todo {
  open: any;

  constructor(avocado: App) {
    var indexedDB = window.indexedDB;

    // Open (or create) the database
    var open = indexedDB.open("AvocadoTodos", 1);

    // Create the schema
    open.onupgradeneeded = () => {
      var db = open.result;
      var store = db.createObjectStore("AvocadoTodoObjectStore", {keyPath: "id"});
    };

    open.onsuccess = () => {};

    this.open = open;
  }

  create(_ call: PluginCall) {
    return new Promise((resolve, reject) => {
      var db = this.open.result;
      var tx = db.transaction("AvocadoTodoObjectStore", "readwrite");
      var store = tx.objectStore("AvocadoTodoObjectStore");
      const res = store.put(call.data);
      return res.complete.then(() => {
        resolve(todo);
      });
    })
  }
  // ...
}
````