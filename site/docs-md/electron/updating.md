---
title: Updating Your Capacitor Electron Project
description: Updating Your Capacitor Electron Project
url: /docs/electron/updating
contributors:
  - devinshoemaker
---

# Updating Your Capacitor Electron Project

<p class="intro">Occasionally, you'll need to make Capacitor updates to your Electron app, including new ways of interfacing with Capacitor inside of your Electron codebase.</a>


## Updating Capacitor Electron Library

To update the version of @capacitor/electron used in your app, just npm install latest version from inside electron folder:

```bash
cd electron
npm install @capacitor/electron@latest
```

## Updating Electron Project

To update the base structure of your Electron project, view the [electron-template](https://github.com/ionic-team/capacitor/tree/master/electron-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.

### From 1.0.0 to 1.1.0

Recommended changes:

* Update `index.js` to not use `injectCapacitor` function as it's now deprecated and will be removed on 2.0.0. It also fixes problems when using electron 5. [See example](https://github.com/ionic-team/capacitor/commit/5d244a196e429d19f33bae5fc1fad6f1e9205168#diff-bae4e5cfce4de49634ffd504a19c8311)
* Create a `.gitignore` file inside `electron` folder with [this content](https://github.com/ionic-team/capacitor/blob/7c1cf397ba7e113429ef89da0f198ffc206b69f0/electron-template/gitignore)
* Update `electron-is-dev` dependency to `^1.1.0` as on the [template](https://github.com/ionic-team/capacitor/blob/cf09bb42fe4bf39b3064b7bc38de04e681d6fab3/electron-template/package.json#L10)
