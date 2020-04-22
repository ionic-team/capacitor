---
title: Running your App 
description: Running your App
url: /docs/basics/running-your-app
contributors:
  - dotnetkow
  - mlynch
---

# Running your App

<p class="intro">Capacitor relies on each platform's IDE of choice to run and test your app.</p>

## iOS

Currently, iOS requires using Xcode to run your app.

```bash
npx cap open ios
```

Once Xcode launches, you can build/simulate/run your app through the standard Xcode workflow.

## Android

```bash
npx cap open android
```

Once Android Studio launches, you can build/emulate/run your app through the standard Android Studio workflow.

## Progressive Web App

Capacitor has a tiny development web server for simple testing, but generally you'll run your web app
using your framework of choice's server tools.

```bash
npx cap serve
```

This will open your web app in a local web server instance in the browser.
