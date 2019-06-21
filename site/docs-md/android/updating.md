---
title: Updating Your Capacitor Android Project
description: Updating Your Capacitor Android Project
url: /docs/android/updating
contributors:
  - mlynch
  - jcesarmobile
---

# Updating Your Capacitor Android Project

<p class="intro">Occasionally, you'll need to make Capacitor updates to your Android app, including updating the version of Capacitor used in your app, or using new ways of interfacing with Capacitor inside of your Android codebase.</a>

## Updating Capacitor Android Library

To update the version of @capacitor/android used in your app, just npm install latest version:

```bash
npm install @capacitor/android@latest
```

Then from Android Studio click the "Sync Project with Gradle Files" button.

## Updating Android Project

To update the base structure of your Android project, view the [android-template](https://github.com/ionic-team/capacitor/tree/master/android-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.

### From 1.0.0 to 1.1.0

Recommended change:
* Update `.gitignore` file inside `android` folder with [this changes](https://github.com/ionic-team/capacitor/commit/e27586780baed231c09f2737bb94a9338aab5a03#diff-15c65f143d85c95277307da1bdd0528e)
