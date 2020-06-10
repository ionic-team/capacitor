<br />
<p align="center">
  <img src="https://user-images.githubusercontent.com/236501/83809024-9da80580-a66a-11ea-8a1d-090fe6f8b01e.png" width="372" height="70" /><br />
</p>
<p align="center">
  ⚡️ Cross-platform apps with JavaScript and the Web ⚡️
</p>
<br />
<p align="center">
  <a href="https://github.com/ionic-team/capacitor/actions?query=workflow%3ACI"><img src="https://img.shields.io/github/workflow/status/ionic-team/capacitor/CI?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/dw/@capacitor/core?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/v/@capacitor/core?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor/core"><img src="https://img.shields.io/npm/l/@capacitor/core?style=flat-square" /></a>
</p>
<p align="center">
  <a href="https://capacitor.ionicframework.com/docs"><img src="https://img.shields.io/static/v1?label=docs&message=getcapacitor.com&color=blue&style=flat-square" /></a>
  <a href="https://twitter.com/capacitorjs"><img src="https://img.shields.io/twitter/follow/capacitorjs" /></a>
</p>

---

Capacitor is a cross-platform API and code execution layer that makes it easy to call Native SDKs from web code and to write custom native plugins that your app may need. Additionally, Capacitor provides first-class Progressive Web App support so you can write one app and deploy it to the app stores _and_ the mobile web.

Capacitor comes with a Plugin API for building native plugins. Plugins can be written inside Capacitor apps or packaged into an npm dependency for community use. Plugin authors are encouraged to use Swift to develop plugins in iOS and Kotlin (or Java) in Android.

## Getting Started

Capacitor was designed to drop-in to any existing modern web app. Run the following commands to initialize Capacitor in your app:

```
npm install @capacitor/core @capacitor/cli
npx cap init
```

Next, install any of the desired native platforms:

```
npx cap add android
npx cap add ios
```

### New App?

For new apps, we recommend trying the [Ionic Framework](https://ionicframework.com/) with Capacitor.

To begin, install the [Ionic CLI](https://ionicframework.com/docs/cli/) (`npm install -g @ionic/cli`) and start a new app:

```
ionic start --capacitor
```

## FAQ

#### What are the differences between Capacitor and Cordova?

In spirit, Capacitor and Cordova are very similar. Capacitor offers backward compatibility with a vast majority of Cordova plugins.

Capacitor and Cordova differ in that Capacitor:

- takes a more modern approach to tooling and plugin development
- treats native projects as source artifacts as opposed to build artifacts
- is maintained by the Ionic Team itself 💙😊

See [the docs](https://capacitor.ionicframework.com/docs/cordova#differences-between-capacitor-and-cordova) for more details.

#### Do I need to use Ionic Framework with Capacitor?

No, you do not need to use Ionic Framework with Capacitor. Without the Ionic Framework, you may need to implement Native UI yourself. Without the Ionic CLI, you may need to configure tooling yourself to enable features such as [livereload](https://ionicframework.com/docs/cli/livereload). See [the docs](https://capacitor.ionicframework.com/docs/getting-started/with-ionic) for more details.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) 💖

To help with the Capacitor website or documentation, [see here](site/CONTRIBUTING.md).
