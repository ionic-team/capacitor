---
title: Using Capacitor Plugins
description: How to use Capacitor plugins, known as Capacitor APIs
url: /docs/basics/using-plugins
contributors:
  - jcesarmobile
  - dotnetkow
---

# Using Capacitor Plugins

Capacitor ships with a number of built-in plugins, known as Capacitor APIs, such as [Camera](/docs/apis/camera) and [Filesystem](/docs/apis/filesystem).

However, chances are your app will need to access more native functionality than provided out of the box in Capacitor.

If you are willing and able to write a small amount of native code, you can quickly add your own native functionality and expose it as a Capacitor plugin by following the [Plugin Guide](/docs/plugins/).

## Finding Plugins

The community has built a number of plugins for various native functionality, and you can easily add them to your app.

See our [Community Plugins](/docs/community/plugins/) list for some options.

Capacitor also supports a wide range of [Cordova plugins](/docs/basics/cordova), so there are a lot to choose from.

## Installing Plugins

To install a Capacitor or Cordova plugin, simply run

```
npm install --save name-of-plugin
npx cap update
```

Capacitor will detect the plugin and install it.

## Updating Plugins

To update a plugin, run

```
npm install --save name-of-plugin
npx cap update
```

Capacitor will detect the new version of the plugin and install it.

## Cordova Support

Capacitor supports a wide variety of Cordova plugins, but there are some things to keep in mind. Follow
the [Cordova Plugin Usage Guide](/docs/basics/cordova) for more information.