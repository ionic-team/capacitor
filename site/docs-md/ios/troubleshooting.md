# iOS Troubleshooting Guide

Creating a 100% perfect native management tool is nearly impossible, and sooner or later you'll run into various issues with some part of the iOS workflow.

This guide attempts to document common iOS/Xcode issues with possible solutions.

## iOS Toolbox

Every iOS developer learns a few common techniques for debugging iOS issues, and you should incorporate these into your workflow:

#### Google, Google, Google

Any time you encounter an issue with iOS, or Xcode, your first step should be to copy and paste the error into a Google search.

Capacitor uses the standard iOS toolchain, so chances are if you run into something, many iOS developers have as well, and there's a solution out there.

It could be as simple as updating a dependency, running clean, or removing Derived Data

#### Clean/Rebuild

Cleaning and rebuilding can fix a number of build issues:

### Removing Derived Data

Sometimes, Xcode clings to old, outdated build artifacts. To start fresh, you'll need to delete any Derived Data on disk.

To do this, open Xcode Preferences, choose the Locations tab, and click the small arrow next to your Derived Data path:

![Locations](/assets/docs/ios/location-prefs.png)

This opens a Finder window to the location of Xcode's temporary Derived Data.

Next, select all items in that directory and delete:

![Deleting Derived Data](/assets/docs/ios/deleting-derived-data.png)

Finally, do a rebuild in Xcode.