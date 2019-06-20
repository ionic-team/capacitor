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