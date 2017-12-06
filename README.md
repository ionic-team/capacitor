# AvocadoJS

Monorepo for Avocado libraries.

### Directory Structure

* `cli`: Avocado CLI
* `core`: Avocado Core JS library
* `ios`: Avocado iOS Runtime
* `ios-template`: Default iOS App installed by the CLI
* `android`: Avocado Android Runtime
* `android-template`: Default Android App installed by the CLI
* `example`: iOS Example for development

### Running iOS Example

```
cd core
npm run build
sudo npm link
```

```
cd example
npm link @avocadojs/core
npm run build && cp -R www/* ios/IonicRunner/www/
```

Then open `example/ios/IonicRunner/IonicRunner.xcodeproj` and run it

### Running Android Example

First, we need to build the Android runtime. Open `android` in Android Studio and do a build. Copy
`android/avocado/build/outputs/aar/avocado-debug.aar` to `example/android/avocado-debug/`

Open `examples/android` in Android Studio, run in emulator or on device.

Enjoy.
