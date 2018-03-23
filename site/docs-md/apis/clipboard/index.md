<plugin-platforms platforms="pwa,ios,android,electron"></plugin-platforms>

# Clipboard

The Clipboard API enables copy and pasting to/from the clipboard. On iOS this API also allows 
copying images and URLs.

<plugin-api index="true" name="clipboard"></plugin-api>

## Example

```typescript
const { Clipboard } = Plugins;

Clipboard.write({
  string: "Hello, Moto"
});

let str = await Clipboard.read({
  type: "string"
});
console.log('Got string from clipboard:', str.value);
```

## API

<plugin-api name="clipboard"></plugin-api>