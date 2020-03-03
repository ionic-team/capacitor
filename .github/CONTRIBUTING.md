# Contributing to Capacitor

This guide attempts to make it easy for volunteer contributors and the core team to contribute to and publish Capacitor. Please let us know if there's something missing!

## Design Philosophy

Before working on Capacitor, it's important to understand the philosophy behind the project to avoid investing time in things that won't fit into the goals of the project.

Please read [@maxlynch](http://twitter.com/maxlynch)'s essay [How Capacitor Works](https://tinyletter.com/ionic-max/letters/how-capacitor-works) for a deep dive into the project and its goals.

## Consult with the team

For any large changes, make sure you've consulted with the team first. One way to do this would be to create a draft PR for discussion, or bringing up the discussion in the Capacitor slack.

## About Third Party Libraries

To achieve Capacitor's goal of being stable and easy to upgrade, we would like to avoid unnecessary third party libraries as much as possible. Before embarking on Capacitor contributions, make sure you aren't planning on introducing third party libraries without consulting with the team first.

On native, that means avoid adding any new Cocoapod or Gradle dependencies without explicit approval. If you just need a small bit of functionality from that library, consider adding an implementation to the codebase directly.

On web, this means do not add any third party libraries such as Firebase or Lodash. Strive for implementations that use pure Web APIs even if it means more work.

## Directory Structure

The `ionic-team/capacitor` repo is a monorepo containing all of the standard Capacitor components. The current directory structure looks like this:

* `app-template`: The default app template used during `create`
* `cli`: Capacitor CLI/Build scripts
* `core`: Capacitor Core JS library
* `ios`: Capacitor iOS Runtime
* `ios-template`: Default iOS App installed by the CLI
* `android`: Capacitor Android Runtime
* `android-template`: Default Android App installed by the CLI
* `example`: Example project for development
* `e2e`: An end-to-end testing app
* `plugin-template`: The default plugin template when creating a new plugin
* `scripts`: deploy and task scripts
* `site`: Website and documentation

## Developing Capacitor

1. Check out this repository.
2. Read and follow [`example/README.md`](../example/README.md)

## Deploying Capacitor (requires commit privileges)

The `publish` npm task runs lerna to update and publish JS dependencies, and then uses that version number to deploy the Android and iOS runtimes.

Additionally, it updates the master branch of the [capacitor-starter](https://github.com/ionic-team/capacitor-starter) mirror, which contains an exported starter project for easy project creation, based on the code in the `starter` folder in this monorepo.

Before deploying, you must set the following environment variables:

 - `BINTRAY_USER`: your username from [bintray.com](http://bintray.com)
 - `BINTRAY_KEY`: your API key from Bintray, found in the "Edit Profile" section of the site.
 
Finally, to deploy Capacitor, in the root of the project run
 
```bash
npm run publish
```

Note: if you don't have any JS updates that cause lerna to increment the version, just increment it yourself in `lerna.json` and you're golden.
