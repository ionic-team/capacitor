---
title: Development Workflow 
description: Capacitor Workflow
url: /docs/basics/workflow
contributors:
  - dotnetkow
  - mlynch
---

# Capacitor Workflow

<p class="intro">The Capacitor workflow involves a few consistent tasks:</p>

## 1. Develop and build your Web App

Capacitor turns your web app into a native binary for each platform. Thus, much of your work will consist of developing and then building a mobile-focused web app.

You will interact with the native platform underneath using Capacitor's APIs (such as [Camera](../apis/camera)), or by using existing Cordova plugins with Capacitor's [Cordova Compatibility](./cordova).

As a final step you will build your application using a command similar to

```bash
npm run build
```

If you are using a framework, follow your framework's build process. 

If for example you are using [Ionic](https://ionicframework.com/), this would be

```bash
ionic build
```

## 2. Copy your Web Assets

When you are ready to run your app natively on a device or in a simulator, copy your built web assets using

```bash
npx cap copy
```

## 3. Open your Native IDE

Capacitor uses the Native IDEs to build, simulate, and run your app. To open it run

```bash
npx cap open
```

## 4. Update the native project

In some cases, the Capacitor app needs to be updated, such as when installing new plugins.

To install new plugins (including Cordova ones), run

```bash
npm install really-cool-plugin
npx cap update
```

## 5. Updating Capacitor

To check if there are any new updates to Capacitor itself, run `npx cap doctor` to print out the current installed dependencies as well view the latest available.

To update Capacitor Core and CLI:

```bash
npm update @capacitor/cli
npm update @capacitor/core
```

To update any or all of the platforms you are using:

```bash
npm update @capacitor/ios
npm update @capacitor/android
```