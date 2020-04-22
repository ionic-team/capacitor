---
title: Installing Capacitor
description: Installing Capacitor
url: /docs/getting-started
contributors:
  - dotnetkow
  - jcesarmobile
---

# Installing Capacitor

<p class="intro">There are two ways to start using Capacitor: adding Capacitor to an existing frontend project (recommended), or starting a fresh project. Capacitor was designed primarily to drop-in to existing frontend projects, but comes with a simple starting project structure if you'd like to start fresh.</p>

<p class="intro">Capacitor provides a native mobile runtime and API layer for web apps. It does <em>not</em> come with any specific
set of UI controls which you will most likely need unless you're building a game or something similar.</p>

<p class="intro">We strongly recommend starting a Capacitor project with your mobile frontend framework of choice (such as <a href="https://ionicframework.com" target="_blank">Ionic</a>).</p>

## Before you start

Make sure you have all the required [Dependencies](./dependencies) installed for the platforms you will be building for. Most importantly,
make sure you update CocoaPods using `pod repo update` before starting a new project, if you plan on building for iOS using a Mac.

## Adding Capacitor to an existing Ionic App

[See here.](/docs/getting-started/with-ionic)

## Adding Capacitor to an existing web app

Capacitor was designed to drop-in to any existing modern JS web app. A valid `package.json` file and a folder containing all web assets are required to get started.

To add Capacitor to your web app, run the following commands:

```bash
cd my-app
npm install --save @capacitor/core @capacitor/cli
```

Then, initialize Capacitor with your app information.

*Note: `npx` is a new utility available in npm 5 or above that executes local binaries/scripts to avoid global installs.*

```bash
npx cap init
```

This command will prompt you to enter the name of your app and the app id (the package name for Android and the bundle identifier for iOS). Use the `--web-dir` flag to set the web assets folder (the default is `www`).

Next, install any of the desired native platforms:

```bash
npx cap add android
npx cap add ios
```

🎉 Capacitor is now installed in your project. 🎉

## Optional: Starting a fresh project

Capacitor comes with a stock project structure if you'd rather start fresh and plan to add a UI/frontend framework separately.

To create it, run:

```bash
npx @capacitor/cli create
```

This command will prompt you to enter the name of your app and the app id (the package name for Android and the bundle identifier for iOS).

This will create a very simple starting app with no UI library.

## Where to go next

Make sure you have the [Required Dependencies](/docs/getting-started/dependencies) installed, including [PWA Elements](/docs/pwa-elements), then proceed to the
[Developer Workflow Guide](/docs/basics/workflow) to learn how Capacitor apps are built.
