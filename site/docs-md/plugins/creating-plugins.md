# Creating Avocado Plugins

An Avocado plugin relies on a JavaScript layer that proxies calls to Avocado's cross-platform runtime which runs
the corresponding native or pure-web code to handle the operation.

Thus, an Avocado plugin consists of some JavaScript and then a native implementation for each platform that requires it.

Let's implement a simple Todo plugin that stores a list of Todo's in native device storage or web storage depending on the platform available.

## JavaScript Side

```typescript
import { Plugin } from 'avocado-js';

import { Todo } from './definitions';

@Plugin({
  name: 'Todo',
  id: 'avocado-plugin-todo'
})
export class Todo {
  async create(todo: Todo) : Todo {
    return await this.nativePromise('create', {
      todo
    });
  }

  async update(todo: Todo) {
    return await this.nativePromise('update', {
      todo
    });
  }

  async delete(todo: Todo) {
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

```bash
avocado generate plugin avocado-plugin-todo AvocadoTodo ios
```

`plugin/AvocadoTodo.swift`

```swift
import Avocado

class AvocadoTodo extends Plugin {
  public init() {
  }

  @objc public func create(_ call: PluginCall) {
    // Create the Todo
    let todo = Todo()
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
  }

  @objc public func delete(_ call: PluginCall) {
  }
}

## Web Plugin

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