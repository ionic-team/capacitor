# Troubleshooting Android Issues

Creating a 100% perfect native management tool like Capacitor is not possible, and sooner or later you'll run into various issues with some part of the Android workflow.

This guide attempts to document common Android issues with possible solutions.

## Android Toolbox

Every Android developer learns a few common techniques for debugging Android issues, and you should incorporate these into your workflow:

### Google, Google, Google

Any time you encounter an issue with Android, or Gradle, or Emulators, your first step should be to copy and paste the error into a Google search.

Capacitor uses the standard Android toolkit, so chances are if you run into something, many Android developers have as well, and there's a solution out there.

It could be as simple as updating a dependency, running Gradle sync, or invalidating caches

### Clean/Rebuild

Cleaning and rebuilding can fix a number of build issues:

![Android Clean and Build](/assets/img/docs/android/clean-rebuild.png)

### Invalidate Caches/Restart

If you're confident you fixed an issue, but Android Studio or Gradle doesn't agree, often the solution is to have Android Studio invalidate its caches and restart the program.

That can be done easily from the File menu:

![Android Invalidate Caches](/assets/img/docs/android/invalidate-caches.png)

## APK Can't be installed

An APK not installing to an Emulator or Device is often due to having an existing app with the same package name. You may see an error like this when trying to run your app:

![Android APK Failed](/assets/img/docs/android/apk-failed.png)

The solution is to remove any old apps and make sure your package name is up to date in `AndroidManifest.xml` and not conflicting with other apps you are developing.

Finally, do a clean and rebuild just in case.

## Recreating your project

Capacitor lets you manage your own Android project. Like any IDE-backed project, sometimes things get so out of sync that the only solution is to rebuild the project.

To do this, follow these steps:

1. Copy any source code you created (such as Java files in `app/android/src`, manifest files, or resource files) into a safe location outside of `app/android`.
2. Next, make sure you are running an updated version of the Capacitor CLI: `npm install @capacitor/cli@latest`
3. Remove the android directory: `rm -rf android/`
4. Re-create the Android app from Capacitor: `npx capacitor add android`
5. Copy your saved source files back into the project
