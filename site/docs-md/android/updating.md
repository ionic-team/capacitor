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

## Updating Android Project

To update the base structure of your Android project, view the [android-template](https://github.com/ionic-team/capacitor/tree/master/android-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.