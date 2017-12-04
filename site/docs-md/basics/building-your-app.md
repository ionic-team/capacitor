# Building your App

Avocado works on a three-step build process. First, your web code is built if necessary. Next, the built web code is copied to each platform, and finally the app is compiled using the platform-specific tooling.

## iOS

iOS relies on Xcode to do the final app compile

```bash
avocado build
avocado copy ios
avocado open ios
```

Once XCode launches, you can build your finally app binary through the standard XCode workflow.

## Android

```bash
avocado build
avocado copy android
avocado compile android
```

## Web

```bash
avocado build
```