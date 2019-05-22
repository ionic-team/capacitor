# Embedding Capacitor into Existing Native Apps

Capacitor was built from the ground up to support being embedded directly into existing iOS and Android native apps.

Many teams are exploring adding web content to an existing native app for developer and feature velocity reasons, or to transition their app over to web technology over time.

## Concepts

When Capacitor is embedded in an existing native app, it becomes a `ViewController` (iOS) or `View` (Android) that manages an embedded WebView while providing a web-to-native bridge to expose native functionality to the Web View.

That means you can add new screens or views in your app that display this managed Capacitor view, which will then load
web content in that screen with full access to your Capacitor plugins.

## iOS Embedding

### Installation

To embed Capacitor in an existing native app, first install the `@capacitor/core` npm package and copy the `native-bridge.js` file over, then install the Capacitor pod.

```
npm install @capacitor/core
cp node_modules/\@capacitor/core/native-bridge.js MyApp/public/
```

The `native-bridge.js` file is the "glue" that helps the WebView communicate with the native layer.

Next, install the CocoaPod for Capacitor:

```ruby
use_modular_headers!
use_frameworks!

target 'CapacitorEmbedTest' do
  pod 'Capacitor', '~> VERSION'
end
```

Where `VERSION` is the latest version of Capacitor.


### Usage

Then, to use a Capacitor View Controller to display web content, use `CAPBridgeViewController` anywhere you want to have a Capacitor-powered Web View, for example as the view controller for a tab in `UITabBarController`.

### Configuration

Chances are, you'll want to display different content for different instances of each Capacitor view. To do this,
set `startDir` on the `CAPBridgeViewController` instance, either manually or using `User Defined Runtime Attributes` in
the storyboard tool.

`startDir` is relative to the `public` resource folder, so a value of `tab1` will load `public/tab1/index.html` as the first
page.


## Android Embedding

Coming soon.