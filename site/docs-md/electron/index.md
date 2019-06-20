---
title: Building Electron Apps with Capacitor
description: Building Electron Apps with Capacitor
url: /docs/electron
contributors:
  - mlynch
---

# Building Electron Apps with Capacitor

<p class="intro">Capacitor has preliminary support for <a href="https://electronjs.org" target="_blank">Electron</a>, the popular tool used for building desktop apps with HTML, JavaScript, and CSS.</p>

<p class="intro">With Electron, Capacitor apps can run natively on Windows, Mac, and Linux.</p>

<blockquote>Electron support for Capacitor is currently in preview, and lags behind iOS, Android, and Web support.</blockquote>

## Getting Started

After creating a new Capacitor app, add the `electron` platform:

```bash
npx cap add electron
```

This will generate a new Electron project in the `electron/` folder in the root of your app.

## Preparing your app

Just like the other Capacitor platforms, the `copy` command must be run periodically to sync web content with Electron:

```bash
npx cap copy
```

Run this after making any modifications to your web app.

## Running your App

To run your app, use

```bash
npx cap open electron
```

This will launch an Electron instance running your app.

## Plugin Support

Electron supports any plugin with a Web implementation, as well as a few plugins with custom Electron support (such as `Filesystem`).

We will have more info on building Electron plugins soon.

## Where to go next

That's pretty much all you need to know to build an Electron app with Capacitor!

Follow the [Development Workflow](../basics/workflow) guide to continue building and testing your app.