# Building your App

Capacitor works on a three-step build process. First, your web code is built if necessary. Next, the built web code is copied to each platform, and finally the app is compiled using the platform-specific tooling.

## iOS

iOS relies on Xcode to do the final app compile

```bash
npm run capacitor build
npm run capacitor copy ios
npm run capacitor open ios
```

Once XCode launches, you can build your finally app binary through the standard XCode workflow.

## Android

```bash
npm run capacitor build
npm run capacitor copy android
npm run capacitor compile android
```

## Web

Capacitor doesn't require any kind of build step for your web code. If you're using the standard
"build" script in npm, then just run

```bash
npm run build
```

And capacitor will use the built web code in your `webDir` in your `capacitor.config.json`.

If your web app doesn't need a build step, then skip the build and you're good to go.