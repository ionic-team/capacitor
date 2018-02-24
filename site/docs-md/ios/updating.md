# Updating Your Capacitor iOS Project

Occasionally, you'll need to make Capacitor updates to your iOS app, including updating the version of Capacitor used in your app, or using new ways of interfacing with Capacitor inside of your iOS codebase (for example, with new iOS API changes).

## Updating Capacitor Library

To update the version of Capacitor used in your app, ust run

```bash
npx cap update ios
```

To update iOS, including any plugins and the core Capacitor libraries.

## Updating iOS Project

To update the base structure of your Xcode project, view the [ios-template](https://github.com/ionic-team/capacitor/tree/master/ios-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.

In particular, [AppDelegate.swift](https://github.com/ionic-team/capacitor/blob/master/ios-template/App/App/AppDelegate.swift) should be checked regularly for possible changes to iOS events.
