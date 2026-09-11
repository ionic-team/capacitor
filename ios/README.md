# Capacitor iOS

The Capacitor iOS package provides the iOS runtime for Capacitor applications. It allows you to build and deploy your web application to iOS devices and simulators.

## Installation

Install the ios package:

```bash
npm install @capacitor/ios
```

Add the iOS platform to your Capacitor project:

```bash
npx cap add ios
```

## Usage

### Opening the iOS Project

To open your iOS project in Xcode:

```bash
npx cap open ios
```

### Running on Simulator/Device

You can run your app directly from the command line:

```bash
npx cap run ios
```

## Configuration

The iOS configuration is handled primarily through `capacitor.config.ts` and the native `Info.plist`.

### Permissions

Add usage descriptions to your `ios/App/App/Info.plist` file as needed by your plugins.

```xml
<key>NSCameraUsageDescription</key>
<string>We need access to the camera to take photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show local content</string>
```

## Version Compatibility

| Capacitor Version | iOS Version | Xcode Version |
|------------------|-------------|---------------|
| v6.x             | iOS 13+     | 15.0+         |
| v5.x             | iOS 13+     | 14.1+         |

## Local Development

If you're contributing to the Capacitor iOS runtime:

1. Clone the repository
2. Run `npm install` in the root
3. Open `ios/Capacitor/Capacitor.xcworkspace` in Xcode

## Resources

- [iOS Deployment Guide](https://capacitorjs.com/docs/ios/deploy)
- [Troubleshooting iOS](https://capacitorjs.com/docs/ios/troubleshooting)
- [Capacitor Documentation](https://capacitorjs.com/docs)

## License

- [MIT](https://github.com/ionic-team/capacitor/blob/HEAD/LICENSE)
