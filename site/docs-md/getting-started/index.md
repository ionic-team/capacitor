# Getting Started With Capacitor

There are two ways to start using Capacitor: adding Capacitor to an existing frontend project, or starting a fresh project.

Capacitor provides a native mobile runtime and API layer for web apps. It does _not_ come with any specific
set of UI controls which you will most likely need unless you're building a game or something similar.

We strongly recommend starting an Capacitor project with your mobile frontend framework of choice (such as Ionic),
though we also provide a blank starter for apps that aren't using a frontend UI framework, and a starter that uses Ionic and
is ready for building a production-ready native app and Progressive Web App.

## Starting a fresh project

To start a fresh Capacitor project, first clone the starter base:

```
git clone https://github.com/ionic-team/capacitor-starter my-app
cd my-app
npm install
```

Next, run the capacitor initialization command _in the directory of the app_.

```
npx capacitor init
```

*Note: `npx` is a new utility available in npm 5 or above that executes local binaries/scripts to avoid global installs.*

As of version 0.1.0, this will create a very simple starting app with no UI library that you should nuke before
starting your own app.

## Using Capacitor Starter with Ionic Framework

Integration into the Ionic CLI is coming soon.

For now, create a new ionic app using `ionic start`, then follow the steps below to add
Capacitor to an existing web app (in this case, your new Ionic app).

## Adding Capacitor to an existing web app

Capacitor was designed to drop-in to any existing modern JS web app.

To add Capacitor to your web app, run the following commands:

```
cd my-app
npm install --save @capacitor/core @capacitor/cli
npx capacitor init
```

When prompted whether this is a new project, select "n"

## Where to go next

Make sure you have the [Required Dependencies](/docs/getting-started/dependencies) installed, then proceed to [App Configuration](/docs/basics/configuring-your-app) and [Building your App](/docs/basics/building-your-app)