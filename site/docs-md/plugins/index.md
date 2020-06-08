---
title: Capacitor Plugins
description: Capacitor Plugins
url: /docs/plugins
contributors:
  - mlynch
  - jcesarmobile
---

# Capacitor Plugins

<p class="intro">Plugins in Capacitor enable JavaScript to interface directly with Native APIs.</p>

## How Capacitor Plugins Work

With Plugins, a web app can access the full power of the Native APIs, doing everything a traditional native app can. Plugins are especially great for wrapping common native operations that might use very different APIs across platforms, while exposing a consistent, cross-platform API to JavaScript.

Additionally, the Plugin capability in Capacitor makes it possible for teams with a mix of traditional native developers and web developers to work together on different parts of the app.

Capacitor auto generates JavaScript hooks on the client, so most plugins only need to build
a native Swift/Obj-C plugin for iOS, and/or a Java one for Android. Of course, adding custom JavaScript
for a plugin is possible, and is just like providing a JavaScript npm package.

## Getting Started

Capacitor comes with a Plugin generator to start new plugins quickly. To use it, run

```bash
npx @capacitor/cli plugin:generate
```

This starts a wizard prompting you for information about your new plugin. For example:

```bash
npx @capacitor/cli plugin:generate
✏️  Creating new Capacitor plugin
? Plugin NPM name (kebab-case): my-plugin
? Plugin id (domain-style syntax. ex: com.example.plugin) com.ionicframework.myplugin
? Plugin class name (ex: AwesomePlugin) MyPlugin
? description:
? git repository:
? author:
? license: MIT
? package.json will be created, do you want to continue? (Y/n)
```

 - `Plugin NPM name`: a kebab-case name of a package that will be available on npm (not a strict requirement if your package will be on a private npm repo).
 - `Plugin ID`: a domain-style identifier. It is primarily used for the package name in Java.
 - `Plugin Class Name`: the initial name of the class used in Java and Swift. See the additional note about class names in the [iOS Plugin](ios/) section of this guide.
 - `description`: a brief introduction about the plugin.
 - `git repository`: the URL to a git repository where the source code of the plugin will be hosted.
 - `author` (optional): the name of the plugin creator in `package.json`.
 - `license` (optional): the license under which the plugin is bound. MIT license is the default.
 - `package.json will be created`: enter "Y" and/or hit Enter/Return to finish plugin setup.

## TypeScript Interface

Each plugin comes with some typescript files that simply export TypeScript interfaces. These interfaces
can provide typing to TypeScript consumers of your plugin.

Starting with the TypeScript interface can be a good way to build out the API for your plugin. For example,
here's the default interface for our Plugin:

```typescript
declare module "@capacitor/core" {
  interface PluginRegistry {
    Echo: EchoPlugin;
  }
}

export interface EchoPlugin {
  echo(options: { value: string }): Promise<{value: string}>;
}
```

## Publishing

Whenever you are ready to publish your plugin, just use:

```bash
npm publish
```

This will build the JS portion of your plugin and publish the rest of your plugin files to NPM.

Your package can now be installed using `npm install your-plugin` in any Capacitor app.

## Next steps

Now it's up to you to make your plugin do something truly awesome!

Follow the [iOS](/docs/plugins/ios) guide for information on using Swift (or Obj-C) to build an iOS plugin, the [Android](/docs/plugins/android) guide for building Android plugins with Java, the [Web](/docs/plugins/web) guide for implementing web and PWA functionality for your plugin, and the [Custom JavaScript](/docs/plugins/js) guide for information on how to build a custom JavaScript plugin (i.e. in addition to Capacitor's auto-JS plugin binding).
