# Migrating from Cordova/PhoneGap to Avocado

Avocado can be used as a replacement for Cordova/PhoneGap in many cases. The two projects provide a web environment with full access to native features and functionality, but with a few differences in their approach to tooling, native project management, and plugins.

## Differences between Avocado and Cordova

Avocado has a few differences in approach that require changing app development workflows.

First, Avocado considers each platform project a _source asset_ instead of a build time asset. That means you'll check in your Xcode and Android Studio projects, as well as use those IDEs when necessary for platform-specific configuration.

We do this for a few reasons:

 1. It's easier to add custom native code that your app might need
 2. Updating and modifying native projects through abstracted-away tools is error prone and a moving target
 3. Adding Native UI shell around your web app is easier when you "own" the project

This change in approach has a few implications. First, Avocado does not use `config.xml` or a similar custom configuration for platform settings; all configuration is done by editing the appropriate platform-specific configuration files directly, such as `AndroidManifest.xml` for Android, and `Info.plist` for Xcode.

Avocado does not run on device or emulate through the command line. Instead, such operations are done through the platform-specific IDE which we believe provides a faster, more typical experience that follows the standards of app development for that platform.