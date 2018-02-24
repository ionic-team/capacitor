# iOS Troubleshooting Guide

Creating a 100% perfect native management tool is nearly impossible, and sooner or later you'll run into various issues with some part of the iOS workflow.

This guide attempts to document common iOS/Xcode issues with possible solutions.

## iOS Toolbox

Every iOS developer learns a few common techniques for debugging iOS issues, and you should incorporate these into your workflow:

### Google, Google, Google

Any time you encounter an issue with iOS, or Xcode, your first step should be to copy and paste the error into a Google search.

Capacitor uses the standard iOS toolchain, so chances are if you run into something, many iOS developers have as well, and there's a solution out there.

It could be as simple as updating a dependency, running clean, or removing Derived Data

### Clean/Rebuild

Cleaning and rebuilding can fix a number of build issues. Navigate to Product -> Clean in the Xcode menu to clean your current build.

### Removing Derived Data

Sometimes, Xcode clings to old, outdated build artifacts. To start fresh, you'll need to delete any Derived Data on disk.

To do this, open Xcode Preferences, choose the Locations tab, and click the small arrow next to your Derived Data path:

![Locations](/assets/img/docs/ios/location-prefs.png)

This opens a Finder window to the location of Xcode's temporary Derived Data.

Next, select all items in that directory and delete:

![Deleting Derived Data](/assets/img/docs/ios/deleting-derived-data.png)

Finally, do a rebuild in Xcode.

## Error: Unable to export required Bridge JavaScript

![Can't export](/assets/img/docs/ios/export-bridge.png)

This error occurs when Capacitor's `native-bridge.js` file was not copied to the native project.

The fix is simple: run `npx cap copy ios` to copy this file.

## Error: Sandbox not in sync with the Podfile.lock

This error can happen if CocoaPods hasn't been able to run to install your dependencies.

Run

```bash
npx cap update ios
```

To update your pods. Perform a new build after running this command.

## Indexing FOREVER

Xcode sometimes gets stuck indexing forever. This unfortunate situation looks like this:

![Xcode indexing](/assets/img/docs/ios/indexing.png)

The only solution is to Force Close Xcode (using Activity Monitor) and start it up again.