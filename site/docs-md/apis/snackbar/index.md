<plugin-platforms platforms="android"></plugin-platforms>

# Snackbar

The Snackbars provide lightweight feedback about an operation!

## Example

```typescript
import { Plugins } from '@capacitor/core';
const { Snackbar } = Plugins;


async show() {
  let clickedRet = await Toast.show({
     text: 'If you are only changing method implementations or resources, you can make them appear faster by using the Apply Changes button.',
     button: 'GOT IT!',
     duration: 'indefinite',
     color: '#488aff'
  });
  console.log('Clicked ret', clickedRet);
}
```

## API

<plugin-api name="snackbar"></plugin-api>