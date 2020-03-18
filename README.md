[![Build Status][circle-badge]][circle-badge-url]

# ⚡️ Cross-platform apps with JavaScript and the Web ⚡️

Capacitor is a cross-platform API and code execution layer that makes it easy to call Native SDKs from web code and to write custom Native plugins that your app might need.  Additionally, Capacitor provides first-class Progressive Web App support so you can write one app and deploy it to the app stores, _and_ the mobile web.

Capacitor was created by the Ionic Framework team as a spiritual successor to Cordova, though it does have backward compatibility with the majority of Cordova plugins. Capacitor can be used without [Ionic Framework](https://ionicframework.com/docs/components), but since it's a core part of the Ionic Platform, it's recommended for the best app development experience.

Capacitor also comes with a Plugin API for building native plugins. On iOS, first-class Swift support is available, and much of the iOS Capacitor runtime is written in Swift. Plugins may also be written in Objective-C. On Android, writing plugins in Java and Kotlin is supported.
 
## Roadmap

_Disclaimer: Our roadmap is subject to change at any time and has no specific date guarantees_

2020 and beyond: The core Capacitor project is now stable. Maintenance is ongoing (including support for new mobile operating system versions, bugs, etc.). Going forward, most new functionality will be implemented as plugins. For the latest updates, track new releases [here](https://github.com/ionic-team/capacitor/releases) or milestones [here](https://github.com/ionic-team/capacitor/milestones).

[2019](https://blog.ionicframework.com/capacitor-in-2019-native-progressive-web-apps-for-all/)

2018

 - __Cordova Plugin Integration__
   - Preliminary support for using plugins from the existing Cordova community
 - __Electron support__
   - Support for building Electron apps and interacting with Node.js libraries
 - __Enterprise Premium Plugins__
   - Paid add-on plugins with support for common Enterprise use cases, such as storage, authentication, security, and more
   - Developer Support options with SLAs and priority patches
   - We are working with a few large teams/businesses as early development partners. Interested? Email [max@ionicframework.com](mailto:max@ionicframework.com)

## Contributing

Contributing to Capacitor may involve writing TypeScript, Swift/Objective-C, Java, or Markdown depending on the component you are working on. We are looking for help in any of these areas!

Please read the [Contributing](.github/CONTRIBUTING.md) guide for more information.

For details on updating the Capacitor website or documentation, [see here](site/CONTRIBUTING.md).

[circle-badge]: https://circleci.com/gh/ionic-team/capacitor.svg?style=shield
[circle-badge-url]: https://circleci.com/gh/ionic-team/capacitor
