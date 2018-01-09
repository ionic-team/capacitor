# Capacitor

Monorepo for Capacitor libraries.

### Directory Structure

* `cli`: Capacitor CLI
* `core`: Capacitor Core JS library
* `ios`: Capacitor iOS Runtime
* `ios-template`: Default iOS App installed by the CLI
* `android`: Capacitor Android Runtime
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
npm link @capacitor/core
npm run build && npm run copy
```

Then open `example/ios/IonicRunner/IonicRunner.xcodeproj` and run it

### Running Android Example

First, we need to build the Android runtime. Open `android` in Android Studio and do a build. Copy
`android/avocado/build/outputs/aar/avocado-debug.aar` to `example/android/avocado-debug/`

Open `examples/android` in Android Studio, run in emulator or on device.

Enjoy.
