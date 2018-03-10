# Installing Capacitor

There are two ways to start using Capacitor: adding Capacitor to an existing frontend project (recommended), or starting a fresh project. Capacitor was designed primarily to drop-in to existing frontend projects, but comes with a simple starting project structure if you'd like to start fresh.

Capacitor provides a native mobile runtime and API layer for web apps. It does _not_ come with any specific
set of UI controls which you will most likely need unless you're building a game or something similar.

We strongly recommend starting a Capacitor project with your mobile frontend framework of choice (such as Ionic),
though we also provide a blank starter for apps that aren't using a frontend UI framework, and a starter that uses Ionic and
is ready for building a production-ready native app and Progressive Web App.

## Before you start

Make sure you have all the required [Dependencies](./dependencies) installed for the platforms you will be building for. Most importantly,
make sure you update CocoaPods using `pod repo update` before starting a new project, if you plan on building for iOS using a Mac.

## Adding Capacitor to an existing web app

Capacitor was designed to drop-in to any existing modern JS web app.

To add Capacitor to your web app, run the following commands:

```
cd my-app
npm install --save @capacitor/core @capacitor/cli
```

Then, init Capacitor with your app information. This will also install the default
native platforms.

```
npx cap init [appName] [appId]
```

Where `appName` is the name of your app, and `appId` is the domain-style app identifier for your app (for example, `com.example.app`)

Capacitor is now installed in your project 🎉

## Using Capacitor Starter with Ionic Framework

Integration into the Ionic CLI is coming soon.

For now, create a new ionic app using `ionic start`, then follow the steps above to add
Capacitor to an existing web app (in this case, your new Ionic app).


## Optional: Starting a fresh project

Capacitor comes with a stock project structure if you'd rather start fresh and plan to add a UI/frontend framework separately.

To create it, run:

```
npx @capacitor/cli create [appDir] [appName] [appId]
```

Where `appDir` is the directory of your app (no spaces), `appName` is the name of your app, and `appId` is the domain-style app identifier for your app (for example, `com.example.app`)

*Note: `npx` is a new utility available in npm 5 or above that executes local binaries/scripts to avoid global installs.*

This will create a very simple starting app with no UI library that you should nuke before
starting your own app.

## Where to go next

Make sure you have the [Required Dependencies](/docs/getting-started/dependencies) installed, then proceed to the
[Developer Workflow Guide](/docs/basics/workflow) to learn how Capacitor apps are built.
