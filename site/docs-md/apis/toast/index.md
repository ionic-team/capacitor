<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Toast

The Toast API provides a notification pop up for displaying important information to a user. Just like real toast!

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { Toast } = Plugins;

async show() {
  await Toast.show({
    text: 'Hello!'
  });
}
```

## API

<plugin-api name="toast"></plugin-api>