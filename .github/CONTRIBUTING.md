# Contributing to Capacitor

This guide attemps to make it easy for volunteer contributors and the core team to contribute to and publish Capacitor. Please let us know if there's something missing!

## Directory Structure

The `ionic-team/capacitor` repo is a monorepo containing all of the standard Capacitor components. The current directory structure looks like this:

* `cli`: Capacitor CLI/Build scripts
* `core`: Capacitor Core JS library
* `ios`: Capacitor iOS Runtime
* `ios-template`: Default iOS App installed by the CLI
* `android`: Capacitor Android Runtime
* `android-template`: Default Android App installed by the CLI
* `example`: iOS Example for development
* `e2e`: an end-to-end testing app

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
