---
title: Migrating Strategy
description: Migration Strategy
url: /docs/cordova/migration-strategy
contributors:
  - dotnetkow
---

# Migration Strategy

<p class="intro">Migrating from Cordova to Capacitor can occur over time or can be fully replaced in many cases. The effort involved will largely depend on the complexity of the app.</p>

## Why Migrate?

Long-term stability and peace of mind. 

Capacitor is [backed by Ionic](https://ionicframework.com/), a long-term contributor to Cordova and the larger open source ecosystem. Ionic still uses Cordova heavily and will continue to invest in the platform for a long time to come.

It’s backward-compatible with Cordova, so you can comfortably switch your existing web apps to it whenever you’re ready. Capacitor was designed from the start to support the rich Cordova plugin ecosystem out of the box. Thus, using Cordova plugins in Capacitor is easy.

## Why Use Ionic with Capacitor?

Using Ionic and Capacitor together is the way to build the best app experience possible, since Ionic Framework provides UI and UX enhancements that Capacitor does not have. Additionally, it works with your favorite web app framework, including Angular, React, and Vue.

With the release of Capacitor, Ionic now controls almost all of its stack. When you build an Ionic app today, we now control the native runtime layer (Capacitor), the UI controls ([Ionic Framework](https://ionicframework.com)), and the “framework” used to build the controls (web components powered by [Stencil](https://stenciljs.com/)). This is significant: If there’s an issue in any part of the stack that we control, we can fix it right away. The only part we don’t control is the frontend framework you use on top (Angular, React, Vue, or plain JavaScript).

Are you using any newer flavors of Ionic, such as `Ionic React` or `Ionic Vue`? Capacitor is the officially supported native runtime.

### Using Ionic Already? Consider Updating to Ionic 4

Capacitor works with any Ionic project (1.0 to 4.x+), but in order to enjoy the best app development experience, Ionic 4 and above is recommended. If you have an existing Ionic 1 to 3 app, begin by following the [Ionic 4 migration guide](https://ionicframework.com/docs/building/migration). If you need further assistance, [Ionic can help.](https://ionicframework.com/enterprise-edition) Advisory Services are available, which includes Ionic 4 training, architecture reviews, and migration assistance.

## Migration Process Overview

### Audit Then Migrate Existing Cordova Plugins

Begin by auditing your existing Cordova plugins - it's possible that you may be able to remove ones that are no longer needed. 

Next, review all of Capacitor's [core plugins](/docs/apis) as well as [community plugins](/docs/community/plugins). You may be able to switch to the Capacitor-equivalent Cordova plugin.

Some plugins may not match functionality entirely, but based on the features you need that may not matter.

### Continue to Use Cordova or Ionic Native if Needed

To leverage Cordova and/or Ionic Native plugins in your Capacitor app, [see here.](/docs/cordova/using-cordova-plugins) If a replacement plugin doesn't exist, continue to use the Cordova plugin as-is. If there's a plugin you'd like to see supported, [please let us know.](https://github.com/ionic-team/capacitor/issues/new)

Ready to [migrate to Capacitor?](/docs/cordova/migrating-from-cordova-to-capacitor)