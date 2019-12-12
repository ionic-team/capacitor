---
title: Updating Your Capacitor iOS Project
description: Updating Your Capacitor iOS Project
url: /docs/ios/updating
contributors:
  - mlynch
---

# Updating Your Capacitor iOS Project

<p class="intro">Occasionally, you'll need to make Capacitor updates to your iOS app, including updating the version of Capacitor used in your app, or using new ways of interfacing with Capacitor inside of your iOS codebase (for example, with new iOS API changes).</p>

## Updating Capacitor iOS Library

To update the version of @capacitor/ios used in your app, just npm install latest version:

```bash
npm install @capacitor/ios@latest
```

Then sync the native project

```bash
npx cap sync ios
```

## Updating iOS Project

To update the base structure of your Xcode project, view the [ios-template](https://github.com/ionic-team/capacitor/tree/master/ios-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.

In particular, [AppDelegate.swift](https://github.com/ionic-team/capacitor/blob/master/ios-template/App/App/AppDelegate.swift) should be checked regularly for possible changes to iOS events.

### From 1.0.0 to 1.1.0

Recommended change:

* Update `.gitignore` file inside `ios` folder with [this changes](https://github.com/ionic-team/capacitor/commit/91941975ea5fe5389e0b09bb8331d5cb16ea6a78#diff-ea346566a7f09b5e88ed28d3d6362ec3)