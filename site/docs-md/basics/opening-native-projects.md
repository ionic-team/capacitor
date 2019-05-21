---
title: Opening Native Projects 
description: Opening Native Projects via Native IDEs
url: /docs/basics/opening-native-projects
contributors:
  - dotnetkow
  - mlynch
---

# Opening Native Projects

Capacitor uses the native IDE for each platform in order to provide required configuration, and to build, test, and deploy apps.

For iOS development, that means you must have Xcode 10 or above installed. For Android, [Android Studio](https://developer.android.com/studio/index.html) 3 or above.

Both IDEs can be opened manually or using the `npx cap open` command:

## Opening Xcode

```bash
npx cap open ios
```

Alternatively, you can open Xcode manually:

```bash
open ios/App/App.xcworkspace
```

## Opening Android Studio

```bash
npx cap open android
```

Alternatively, you can open Android Studio and import the `android/` directory as an Android Studio project.
