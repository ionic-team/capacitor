# Capacitor Workflow

The Capacitor workflow involves a few consistent tasks:

## 1. Build your Web App

Capacitor turns your web app into a native binary for each platform. Thus, much of your work will consist of building a mobile-focused web app.

You will interact with the native platform underneath using Capacitor's APIs (such as [Camera](../apis/camera)), or by using existing Cordova plugins with Capacitor's [Cordova Compatibility](./cordova).

Additionally, this is where you might use [Ionic](https://ionicframework.com/), so follow your framework's build process in that case.

## 2. Copy your Web Assets

When you are ready to run your app natively on a device or in a simulator, copy your built web assets using

```
npx capacitor copy
```

## 3. Open your Native IDE

Capacitor uses the Native IDE's to build, simulate, and run your app.

```bash
npx capacitor open
```

## 4. Periodic Maintenance

Your Capacitor app needs periodic maintenance, such as updating dependencies and installing new plugins.

To update your app's dependencies, run

```bash
npx capacitor update
```

To install new plugins (including Cordova ones), run

```bash
npm install really-cool-plugin
npx capacitor update
```