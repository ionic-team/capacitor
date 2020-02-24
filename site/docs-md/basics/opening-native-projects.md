---
title: Opening Native Projects 
description: Opening Native Projects via Native IDEs
url: /docs/basics/opening-native-projects
contributors:
  - dotnetkow
  - mlynch
---

# Opening Native Projects

<p class="intro">Capacitor uses the native IDE for each platform in order to provide required configuration, and to build, test, and deploy apps.</p>

<p class="intro">For iOS development, that means you must have <a href="https://developer.apple.com/xcode/" target="_blank">Xcode 11</a> or above installed. For Android, <a href="https://developer.android.com/studio/index.html" target="_blank">Android Studio</a> 3 or above.</p>

<p class="intro">Both IDEs can be opened manually or using the <code>npx cap open</code> command:</p>

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
