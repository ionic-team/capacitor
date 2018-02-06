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
    Filesystem.writeFile('secrets/text.txt', "This is a test", FilesystemDirectory.Documents, 'utf8')
  } catch(e) {
    console.error('Unable to write file', e);
  }
}

async fileRead() {
  let contents = await Filesystem.readFile('secrets/text.txt', FilesystemDirectory.Documents, 'utf8');
  console.log(contents);
}

async fileAppend() {
  await Filesystem.appendFile('secrets/text.txt', "MORE TESTS", FilesystemDirectory.Documents, 'utf8');
}

async fileDelete() {
  await Filesystem.deleteFile('secrets/text.txt', FilesystemDirectory.Documents);
}

async mkdir() {
  try {
    let ret = await Filesystem.mkdir('secrets', FilesystemDirectory.Documents, false);
  } catch(e) {
    console.error('Unable to make directory', e);
  }
}

async rmdir() {
  try {
    let ret = await Filesystem.rmdir('secrets', FilesystemDirectory.Documents);
  } catch(e) {
    console.error('Unable to remove directory', e);
  }
}

async readdir() {
  try {
    let ret = await Filesystem.readdir('secrets', FilesystemDirectory.Documents);
  } catch(e) {
    console.error('Unable to read dir', e);
  }
}

async stat() {
  try {
    let ret = await Filesystem.stat('secrets/text.txt', FilesystemDirectory.Documents);
  } catch(e) {
    console.error('Unable to stat file', e);
  }
}
```

## API

<plugin-api name="filesystem"></plugin-api>
