---
title: Cordova and PhoneGap
description: Cordova and PhoneGap
url: /docs/cordova
contributors:
  - dotnetkow
---

# Cordova and PhoneGap

<p class="intro">Apache Cordova (and Adobe PhoneGap), created in 2008, is an open source project that enables web developers to use their HTML, CSS, and JavaScript content to create a native application for a variety of mobile and desktop platforms.</p>

<p class="intro">For more details on the history of Cordova and more details on how it works, <a href="https://ionicframework.com/resources/articles/what-is-apache-cordova" target="_blank">please see here</a>.</p>

## Why Create a New Project?

The open source space is filled with new projects that build on top of older projects, making tangible improvements that can't be done without radically changing the original product. This is what Capacitor would have required. The Ionic team felt like this wasn't possible with Cordova for technical and political reasons. Whether that is right or wrong, that is the conclusion the team came to. That said, Ionic still uses Cordova heavily and will continue to invest in the platform for a long time to come.

On the plus side, Ionic now controls almost all of its stack. When you build an Ionic app and use Capacitor, we control the native runtime layer, the UI controls, and the “framework” used to build the controls ([Stencil](https://stenciljs.com/)). The only part we don’t control is the frontend framework you use on top (Angular, React, Vue, or nothing). This is significant: If there’s an issue in any part of the stack that we control, we can fix it right away. Capacitor has already proven to be a worthwhile investment - it’s enabling us to build a stronger Ionic and focus on what we do uniquely well.

## Differences between Capacitor and Cordova

In spirit, Capacitor and Cordova are very similar. Both manage a Web View and provide a structured way of exposing native functionality to your web code. However, Capacitor has a few key differences that require web developers, previously used to Cordova's approach, to change app development workflows.

### Native Project Management

Capacitor considers each platform project a _source asset_ instead of a _build time asset_. That means you'll check your Xcode and Android Studio projects into source control, as well as use those IDEs when necessary for platform-specific configuration and running/testing.

This change in approach has a few implications. First, Capacitor does not use `config.xml` or a similar custom configuration for platform settings. Instead, configuration changes are made by editing the appropriate platform-specific configuration files directly, such as `AndroidManifest.xml` for Android and `Info.plist` for Xcode. Capacitor does have some [high level configuration options](/docs/basics/configuring-your-app) that are set in `capacitor.config.json`. These generally don't modify native functionality, but control Capacitor's tooling.

Additionally, Capacitor does not "run on device" or emulate through the command line. Instead, such operations occur through the platform-specific IDE, which provides a faster, more typical experience that follows the standards of app development for that platform. For example, running iOS apps from the command line is not officially supported by Apple anyway, so Xcode is preferred.

While these changes may be concerning to long-time Cordova users, there are worthwhile benefits:

 1. Updating and modifying native projects through abstracted-away tools such as `config.xml` is error prone and a constant moving target. Becoming more comfortable with platform-specific tooling makes troubleshooting issues that much easier.
 2. It's easier to add custom native code that your app needs without having to build a new plugin for it. Additionally, native teams can work alongside web teams on the same project. 
 3. Creating more compelling app experiences is now easier since you "own" the native project, such as adding a native UI shell around your web app.
 4. More visibility into native project changes and better app maintainability as new mobile operating system versions are released. When breaking changes to Capacitor are introduced or changes are applied to the native project templates, the team will publish step-by-step upgrade instructions to ensure that the update process is as smooth as possible.

### Plugin Management

Capacitor manages plugins in a different way than Cordova. First, Capacitor does not copy plugin source code to your app before building. Instead, all plugins are built as Frameworks (on iOS) and Libraries (on Android) and installed using the leading dependency management tool for each platform (CocoaPods and Gradle/Maven, respectively). Additionally, Capacitor does not modify native source code, so any necessary native project settings must be added manually (for example, permissions in `AndroidManifest.xml`). We think this approach is less error-prone and makes it easier for developers to find help in the community for each specific platform.

One major difference is the way plugins handle the JavaScript code they need in order to be executed from the WebView. Cordova requires plugins to ship their own JavaScript and manually call `exec()`. Capacitor, in contrast, registers and exports all JavaScript for each plugin based on the methods it detects at runtime, so all plugin methods are available as soon as the WebView loads. One important implication of this: there is no more need for the `deviceready` event. As soon as your app code loads, you can start calling plugin methods.

While Capacitor doesn't require plugins to provide JavaScript, many plugins will want to have logic in JavaScript. In this case, providing a plugin with extra JavaScript is as easy as shipping a traditional JavaScript library (bundle, module, etc), but instead of calling `exec()` in Cordova, the plugin will reference the Capacitor plugin through `Capacitor.Plugins.MyPlugin`.

Finally, Capacitor has implications for plugin authors. On iOS, Swift 4 is officially supported and even _preferred_ for building plugins (Objective-C is also supported). Plugins no longer export a `Plugin.xml` file; Capacitor provides a few simple macros on iOS and Annotations on Android for adding metadata to your plugin source code that Capacitor reads at runtime.

### CLI/Version Management

Capacitor, unlike Cordova, does not use a global CLI. Instead, the Capacitor "CLI" is installed locally into each project as an npm script. This makes it easier to manage versions of Capacitor across many different apps.

Thus, instead of running `capacitor` directly from the command line, Capacitor is invoked by calling `npx cap` in the directory of your app.

## Start the Migration

Learn more about the [migration process](/docs/cordova/migration-strategy) or [get started migrating](/docs/cordova/migrating-from-cordova-to-capacitor) right away.
