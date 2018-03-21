<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Storage

The Storage API provides a key-value store for simple data.

Mobile OS's may periodically clear data set in `window.localStorage`, so this API should be used instead of `window.localStorage`. This API will fall back to using `localStorage` when running as a Progressive Web App.

Note: this API is not meant for high-performance data storage applications. Take a look at using SQLite or a separate data engine if your application will store a lot of items, have high read/write load, or require complex querying.

<plugin-api index="true" name="storage"></plugin-api>

## Working with JSON

`Storage` works on Strings only. However, storing JSON blobs is easy: just `JSON.stringify` the object before calling `set`, then `JSON.parse` the value returned from `get`. See the
example below for more details.

This method can also be used to store non-string values, such as numbers and booleans.

## Example

```typescript
// JSON "set" example
async setObject() {
  await Storage.set({
    key: 'user',
    value: JSON.stringify({
      id: 1,
      name: 'Max'
    })
  });
}

// JSON "get" example
async getObject() {
  const user = JSON.parse(await Storage.get({ key: 'user' }));
}

async setItem() {
  await Storage.set({
    key: 'name',
    value: 'Max'
  });
}

async getItem() {
  const value = await Storage.get({ key: 'name' });
  console.log('Got item: ', value);
}

async removeItem() {
  await Storage.remove({ key: 'name' });
}

async keys() {
  const keys = await Storage.keys();
  console.log('Got keys: ', keys);
}

async clear() {
  await Storage.clear();
}
```

## API

<plugin-api name="storage"></plugin-api>