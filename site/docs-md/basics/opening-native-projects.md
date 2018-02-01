# Opening Native Projects

Capacitor uses the native IDE for each platform in order to provide required configuration, and to build, test, and deploy apps.

For iOS development, that means you must have Xcode 9 or above installed. For Android, [Android Studio](https://developer.android.com/studio/index.html) 3 or above.

Both IDEs can be opened manually or using the `npx capacitor open` command:

## Opening Xcode

```bash
npx capacitor open ios
```

Alternatively, you can open Xcode manually:

```bash
open ios/App/App.xcworkspace
```

## Opening Android Studio

```bash
npx capacitor open android
```

Alternatively, you can open Android Studio and import the `android/` directory as an Android Studio project.
