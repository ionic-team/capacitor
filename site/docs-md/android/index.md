# Capacitor Android Documentation

Capacitor features a native Android runtime that enables developers to communicate between JavaScript and Native Java for Android code.

Capacitor Android apps are configured and managed through Android Studio (generally), with dependencies managed by gradle.

Follow these guides for more information on each topic:

## Getting Started

### Creating Android Project

By default, an Android project is created for every Capacitor project. If you are adding Capacitor to an existing
project, you can manually add the Android project using

```bash
npx capacitor add android
```

### Opening Android Project

To open the project in Android Studio, run

```bash
npx capacitor open android
```

### Syncing Gradle

After opening the project, you _must_ sync Gradle or you will receive an error saying "Please select Android SDK." It's also possible you'll need to sync
Gradle periodically after updating dependencies and changing project settings.

To manually sync Gradle, open Tools -> Android -> Sync Project with Gradle Files from the main menu bar:

![Sync Gradle](/assets/img/docs/android/sync-gradle.png)

## Further Reading

Follow these Android-specific guides for more information on setting permissions for your app, updating dependencies, building
plugins, and more:

[Configuring and setting permissions for Android](./configuration.html)

[Managing plugins and dependencies for Android](./managing-dependencies.html)

[Building Native Plugins for Android](./plugins.html)