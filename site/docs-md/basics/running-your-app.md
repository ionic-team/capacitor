# Running your App

Capacitor relies on each platform's IDE of choice to run and test your app.

## iOS

Currently, iOS requires using Xcode to run your app.

```bash
npm run capacitor open ios
```

Once XCode launches, you can build/simulate/run your app through the standard XCode workflow.

## Android

```bash
npm run capacitor open android
```

Once Android Studio launches, you can build/emulate/run your app through the standard Android Studio workflow.

## Progressive Web App

Capacitor has a tiny development web server for simple testing, but generally you'll run your web app
using your framework of choice's server tools.

```bash
npm run capacitor web
```

This will open your web app in a local web server instance in the browser.

## Electron

(Coming soon)
