# Contributing to Capacitor

This guide attempts to make it easy for volunteer contributors and the core team to contribute to and publish Capacitor. Please let us know if there's something missing!

## Issues & Discussions

The Capacitor repo uses GitHub [issues](https://github.com/ionic-team/capacitor/issues) and [discussions](https://github.com/ionic-team/capacitor/discussions) to track bugs and feature requests, as well as to provide a place for community questions, ideas, and discussions.

* **When to use [issues](https://github.com/ionic-team/capacitor/issues)**:
    * To report specific, reproducible bugs.
    * To propose detailed feature requests.
* **When to use [discussions](https://github.com/ionic-team/capacitor/discussions)**:
    * To ask for help.
    * To ask general questions.
    * To show off cool stuff.
    * To propose ideas for improvement.
    * If you think you found a bug, but may need help to further uncover it.
    * Anything else! :rainbow:

### Creating a Code Reproduction

When reporting bugs, we ask you to provide a minimal sample application that demonstrates the issue. Without a reliable code reproduction, it is unlikely we will be able to resolve the issue, leading to it being closed.

To create a code reproduction:

* Create a new application using `npx @capacitor/cli create` (or `ionic start --capacitor`).
* Add the minimum amount of code necessary to recreate the issue you're experiencing.
* Push the code reproduction to a public GitHub repository and include a link when you create a bug report.
* Be sure to include steps to reproduce the issue.

## Developing Capacitor

### Design Philosophy

Before working on Capacitor, it's important to understand the philosophy behind the project to avoid investing time in things that won't fit into the goals of the project.

Please read [@maxlynch](http://twitter.com/maxlynch)'s essay [How Capacitor Works](https://tinyletter.com/ionic-max/letters/how-capacitor-works) for a deep dive into the project and its goals.
1. Check out this repository.
2. Read and follow [`example/README.md`](../example/README.md)

### Consult with the team

For any large changes, make sure you've consulted with the team first. One way to do this would be to create a draft PR for discussion, or bringing up the discussion in the Capacitor slack.

### About Third Party Libraries

To achieve Capacitor's goal of being stable and easy to upgrade, we would like to avoid unnecessary third party libraries as much as possible. Before embarking on Capacitor contributions, make sure you aren't planning on introducing third party libraries without consulting with the team first.

On native, that means avoid adding any new Cocoapod or Gradle dependencies without explicit approval. If you just need a small bit of functionality from that library, consider adding an implementation to the codebase directly.

On web, this means do not add any third party libraries such as Firebase or Lodash. Strive for implementations that use pure Web APIs even if it means more work.

### Directory Structure

The `ionic-team/capacitor` repo is a monorepo containing all of the standard Capacitor components. The current directory structure looks like this:

* `app-template`: The default app template used during `create`
* `cli`: Capacitor CLI/Build scripts
* `core`: Capacitor Core JS library
* `ios`: Capacitor iOS Runtime
* `ios-template`: Default iOS App installed by the CLI
* `android`: Capacitor Android Runtime
* `android-template`: Default Android App installed by the CLI
* `example`: Example project for development
* `plugin-template`: The default plugin template when creating a new plugin
* `scripts`: publish and task scripts
* `site`: Website and documentation

## Publishing Capacitor

Capacitor packages are published together with a fixed version using [Lerna](https://github.com/lerna/lerna).

To publish Capacitor, run the following:

```bash
npm run publish
```
