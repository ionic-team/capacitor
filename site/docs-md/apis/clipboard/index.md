# Clipboard

The Clipboard API enables copy and pasting to/from the clipboard. On iOS this API also allows 
copying images and URLs.

## Example

```typescript
Plugins.Clipboard.set({
  string: "Hello, Moto"
});

let str = await Plugins.Clipboard.get({
  type: "string"
});
console.log('Got string from clipboard:', str);
```

## API

<plugin-api name="clipboard"></plugin-api>