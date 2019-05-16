# Embedding Capacitor into Existing Native Apps

Capacitor was built from the ground up to support being embedded directly into existing iOS and Android native apps.

Many teams are exploring adding web content to an existing native app for developer and feature velocity reasons, or to transition their app over to web technology over time.

## Concepts

When Capacitor is embedded in an existing native app, it becomes a `ViewController` (iOS) or `View` (Android) that manages an embedded WebView while providing a web-to-native bridge to expose native functionality to the Web View.

That means you can add new screens or views in your app that display this managed Capacitor view, which will then load
web content in that screen.

## iOS Embedding

To embed Capacitor in an existing native app, first install the Capacitor pod:

```ruby
use_modular_headers!
use_frameworks!

target 'CapacitorEmbedTest' do
  pod 'Capacitor', '~> VERSION'
end
```

Then, to use a Capacitor View Controller to display web content, use `CAPBridgeViewController` anywhere you want to have a Capacitor-powered Web View:

## Android Embedding

