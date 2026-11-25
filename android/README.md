# Capacitor Android

The Capacitor Android package provides the Android runtime for Capacitor applications. It allows you to build and deploy your web application to Android devices and emulators.

## Installation

Install the android package:

```bash
npm install @capacitor/android
```

Add the Android platform to your Capacitor project:

```bash
npx cap add android
```

## Usage

### Opening the Android Project

To open your Android project in Android Studio:

```bash
npx cap open android
```

### Running on Device/Emulator

You can run your app directly from the command line:

```bash
npx cap run android
```

## Configuration

The Android configuration is handled primarily through `capacitor.config.ts` and the native `AndroidManifest.xml`.

### Permissions

Add permissions to your `android/app/src/main/AndroidManifest.xml` file as needed by your plugins.

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## Version Compatibility

| Capacitor Version | Android Version | Gradle Version |
|------------------|-----------------|----------------|
| v6.x             | Android 14+     | 8.2+           |
| v5.x             | Android 13+     | 8.0+           |

## Local Development

If you're contributing to the Capacitor Android runtime:

1. Clone the repository
2. Open `android/` in Android Studio
3. Let Gradle sync and build the project

## Resources

- [Android Deployment Guide](https://capacitorjs.com/docs/android/deploy)
- [Troubleshooting Android](https://capacitorjs.com/docs/android/troubleshooting)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## License

- [MIT](https://github.com/ionic-team/capacitor/blob/HEAD/LICENSE)
