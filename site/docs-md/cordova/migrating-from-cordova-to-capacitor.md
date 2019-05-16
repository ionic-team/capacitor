# Migrating from Cordova/PhoneGap to Capacitor

Migrating from Cordova to Capacitor can occur over time or can be a full replacement in many cases.

## Why Migrate?

Long-term stability and peace of mind. With the release of Capacitor, Ionic now controls almost all of its stack. When you build an Ionic app today, we now control the native runtime layer (Capacitor), the UI controls ([Ionic Framework](https://ionicframework.com)), and the “framework” used to build the controls (web components powered by [Stencil](https://stenciljs.com/)). This is significant: If there’s an issue in any part of the stack that we control, we can fix it right away. The only part we don’t control is the frontend framework you use on top (Angular, React, Vue, or nothing). 

It’s backward-compatible with Cordova, so you can comfortably switch your existing Ionic (or any web) apps to it whenever you’re ready. Capacitor was designed from the start to support the rich Cordova plugin ecosystem out of the box. Thus, using Cordova plugins in Capacitor is easy.

Using Ionic React, Ionic Vue, etc.? Capacitor is the officially supported native runtime.

## Migration Process

The migration effort will depend on the complexity of the app. 

### Consider Updating Existing App to Ionic 4

Capacitor works with any Ionic project (1.0 to 4.x+), but in order to enjoy the best app development experience, Ionic 4 and above is recommended. If you have an existing Ionic 1 to 3 app, begin by following the [Ionic 4 migration guide](https://ionicframework.com/docs/building/migration). If you need further assistance, [Ionic can help.](https://ionicframework.com/enterprise-edition) Advisory Services are available, which includes Ionic 4 training, architecture reviews, and migration assistance.

### Audit Existing Cordova Plugins

Begin by auditing your existing Cordova plugins - it's possible that you may be able to remove ones that are no longer needed. 

Next, review all of Capacitor's [core plugins](/docs/apis) as well as [community plugins](/docs/community/plugins). You may be able to switch to the Capacitor-equivalent Cordova plugin. Also note that some Capacitor plugins extend beyond mobile, including [PWA](/docs/web) and [Desktop](/docs/electron/) functionality, which Cordova traditionally hasn't had support for. For example, compare the [Capacitor Camera](/docs/apis/camera) to the [Cordova Camera](https://github.com/apache/cordova-plugin-camera).

Some plugins may not match functionality entirely, but based on the features you need that may not matter.

### Continuing to use Cordova or Ionic Native

Continue to use Cordova plugins as-is if no Capacitor replacement plugins exist. If there's a plugin you'd like to see supported, [please let us know.](https://github.com/ionic-team/capacitor/issues/new)

To leverage Cordova and/or Ionic Native plugins in your Capacitor app, [see here.](/docs/cordova/using-cordova-plugins)