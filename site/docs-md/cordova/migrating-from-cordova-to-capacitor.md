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

If a replacement plugin doesn't exist, continue to use the Cordova plugin as-is. If there's a plugin you'd like to see supported, [please let us know.](https://github.com/ionic-team/capacitor/issues/new)

To leverage Cordova and/or Ionic Native plugins in your Capacitor app, [see here.](/docs/cordova/using-cordova-plugins)

## Guide: Migrating an Existing Ionic App Using Cordova to Capacitor

There are several steps required to fully migrate an Ionic App using Cordova over to Capacitor. **Note:** It's recommended to work in a separate code branch when applying these changes.

### Add Capacitor

Begin by opening your Ionic project in a Terminal, then add Capacitor:

```bash
ionic integrations enable capacitor
```

Next, open `config.xml` and find the `id` field in the widget element. In this example, it's `io.ionic.myapp`.

```xml
<widget id="io.ionic.myapp" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

Also find the `Name` of your app:

```xml
<name>MyApp</name>
```

Now, initialize Capacitor with this app information:

```bash
npx cap init [appName] [appId]
```

In this example, it would be `npx cap init MyApp io.ionic.myapp`. These values can be found in the newly created `capacitor.config.json` file.

#### Build your Ionic App
You must build your Ionic project at least once before adding any native platforms.

```bash
ionic build
```

This ensures that the `www` folder that Capacitor has been [automatically configured](/docs/basics/configuring-your-app/) to use as the `webDir` in `capacitor.config.json` actually exists.

#### Add Platforms

Capacitor native platforms exist in their own top-level folders, compared to Cordova's which are located under `platforms/ios` or `platforms/android`.

```bash
npx cap add ios
npx cap add android
```

Both android and ios folders at the root of the project are created. These are entirely separate native project artifacts that should be considered part of your Ionic app (i.e., check them into source control, edit them in their own IDEs, etc.).

### Open questions

<Author> tag used anywhere?

<allow-intent href="http://*/*" />
<allow-intent href="https://*/*" />
<allow-intent href="tel:*" />
<allow-intent href="sms:*" />
<allow-intent href="mailto:*" />
<allow-intent href="geo:*" />

### Configurations



### Platform Preferences

???

### Splash Screens and Icons

Existing Resources folder...

link to morony content?

### Migrate Plugins

Plugins that must be removed? cordova-plugin-ionic-webview? Link to incompatible list page

link to /docs/cordova/using-cordova-plugins page

### Set Permissions

You'll need to apply permissions manually by mapping between `plugin.xml` and required settings on iOS and Android. Consult the [iOS](/docs/ios/configuration) and [Android](/docs/android/configuration) configuration guides for info on how to configure each platform.

### Removing Cordova

Once comfortable that app is fully working, Cordova can be removed.
- Delete config.xml
- Delete platforms and plugins folder

### Next Steps

This is just the beginning of your Capacitor journey. Continue on by learning about the Capacitor [development workflow](/docs/basics/workflow).