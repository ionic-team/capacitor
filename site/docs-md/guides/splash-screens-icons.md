---
title: Creating Splash Screens and Icons
description: Use cordova-res to generate resource images for native projects
url: /docs/guides/splash-screens-and-icons
contributors:
  - dotnetkow
---

#  Creating Splash Screens and Icons

Initial support for splash screen and icon generation is now available. For complete details, see the [cordova-res docs](https://github.com/ionic-team/cordova-res).

First, install `cordova-res`:

```bash
$ npm install -g cordova-res
```

`cordova-res` expects a Cordova-like structure: place one icon and one splash screen file in a top-level `resources` folder within your project, like so:

```
resources/
├── icon.png
└── splash.png
```

Next, run the following to generate all images then copy them into the native projects:

```bash
$ cordova-res ios --skip-config --copy
$ cordova-res android --skip-config --copy
```
