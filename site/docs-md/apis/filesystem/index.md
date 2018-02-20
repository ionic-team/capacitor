# Filesystem

The Filsystem API provides a NodeJS-like API for working with files on the device.

Current mobile OS's have additional layers of separation between files, such as special directories that are backed up to the Cloud, or ones for storing Documents. The Filesystem API offers a simple way to scope each operation to a specific special directory on the device.

<plugin-api index="true" name="filesystem"></plugin-api>

## Example

```typescript
import { Plugins } from '@capacitor/core';

const { Filesystem } = Plugins;

fileWrite() {
  try {
    Filesystem.writeFile({
      path: 'secrets/text.txt',
      data: "This is a test",
      directory: FilesystemDirectory.Documents,
      encoding: 'utf8'
    })
  } catch(e) {
    console.error('Unable to write file', e);
  }
}

async fileRead() {
  let contents = await Filesystem.readFile({
    path: 'secrets/text.txt',
    directory: FilesystemDirectory.Documents,
    encoding: 'utf8'
  });
  console.log(contents);
}

async fileAppend() {
  await Filesystem.appendFile({
    path: 'secrets/text.txt',
    data: "MORE TESTS",
    directory: FilesystemDirectory.Documents,
    encoding: 'utf8'
  });
}

async fileDelete() {
  await Filesystem.deleteFile({
    path: 'secrets/text.txt',
    directory: FilesystemDirectory.Documents
  });
}

async mkdir() {
  try {
    let ret = await Filesystem.mkdir({
      path: 'secrets',
      directory: FilesystemDirectory.Documents,
      createIntermediateDirectories: false // like mkdir -p
    });
  } catch(e) {
    console.error('Unable to make directory', e);
  }
}

async rmdir() {
  try {
    let ret = await Filesystem.rmdir({
      path: 'secrets',
      directory: FilesystemDirectory.Documents
    });
  } catch(e) {
    console.error('Unable to remove directory', e);
  }
}

async readdir() {
  try {
    let ret = await Filesystem.readdir({
      path: 'secrets',
      directory: FilesystemDirectory.Documents
    });
  } catch(e) {
    console.error('Unable to read dir', e);
  }
}

async stat() {
  try {
    let ret = await Filesystem.stat({
      path: 'secrets/text.txt',
      directory: FilesystemDirectory.Documents
    });
  } catch(e) {
    console.error('Unable to stat file', e);
  }
}
```

## API

<plugin-api name="filesystem"></plugin-api>
