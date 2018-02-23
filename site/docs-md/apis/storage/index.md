# Storage

The Storage API provides a key-value store for simple data.

Mobile OS's may periodically clear data set in `window.localStorage`, so this API should be used instead of `window.localStorage`. This API will fall back to using `localStorage` when running as a Progressive Web App.

Note: this API is not meant for high-performance data storage applications. Take a look at using SQLite or a separate data engine if your application will store a lot of items, have high read/write load, or require complex querying.

<plugin-api index="true" name="storage"></plugin-api>

## Example

```typescript
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