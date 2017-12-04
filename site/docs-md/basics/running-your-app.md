# Running your App

Avocado relies on each platform's IDE of choice to run and test your app.

## iOS

Currently, iOS requires using Xcode to run your app.

```bash
avocado open ios
```

Once XCode launches, you can build/simulate/run your app through the standard XCode workflow.

## Android

```bash
avocado run android
```

This will run your Android app on an available device. Optionally, you can run `avocado open android` and run your app from Android Studio

## Web

```bash
avocado run web
```

This will open your web app in a local web server instance in the browser.

If you have configured a separate tool, such as Ionic, this will launch that serve tool instead.

## Electron

(Coming soon)

```bash
avocado run electron
```

This will start your app in an Electron instance.
