# Capacitor Android runtime [![Download](https://img.shields.io/bintray/v/ionic-team/capacitor/capacitor-android.svg)](https://bintray.com/ionic-team/capacitor/capacitor-android/_latestVersion) [![Twitter Follow](https://img.shields.io/twitter/follow/getcapacitor.svg?style=social&label=Follow&style=flat-square)](https://twitter.com/getcapacitor)

This is the Android runtime for Capacitor.
 
> Capacitor is a cross-platform app runtime that makes it easy to build web apps that run natively on iOS, Android, Electron, and the web.

## Development

Clone the Capacitor github repo and open path `CLONED_CAP_REPO_DIR/android/capacitor` in your favorite IDE (e.g. Intellij IDEA). 

### Logging

To make Capacitor's log stream better searchable by Logcat all Capacitor Android runtime and plugin log tags should have the same form.

Therefore the class `com.getcapacitor.LogUtils` with a **core** and **plugin** tag method should be used to get the log's tag string.

```
Log.i(LogUtils.getCoreTag(), "Your message");
Log.i(LogUtils.getPluginTag(), "Your plugin message");
```

These methods might have subTags: String[] param, joining the Strings together separated by a slash.

For plugins extending `com.getcapacitor.Plugin` the super method `com.getcapacitor.Plugin#getLogTag()` should be used, 
which builds the log tag using a prefix and the class name of the sub class.

Using this simple approach you are able to use the filter string `/Capacitor` in LogCat and get only log statements 
belonging to Capacitor or search by `/Capacitor/Plugin` to get everything related to plugins.

### Local testing

If you want to integration test your runtime changes in your own Capacitor project there are two ways to do so.

#### Change path

**Runtime**

Do your changes.

**Your project**

Open `/yourproject/android/settings.gradle`, which should look like

```
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```

comment line 2-3 and - this is very important - sync your project now!
```
//include ':capacitor-android'
//project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
```

After the sync finished and change the path in the 3rd line so it points to local android runtime
```
project(':capacitor-android').projectDir = new File('../../capacitor/android/capacitor/')
```
and sync again. You should now be able to debug the project either on the emulator or on device.

**Important** If you just change the path Gradle will do strange things and will propably break your project. No idea why!

#### Publish to maven local

**Runtime**

Do your changes and when your ready to test run the below command
```
./gradlew publishToMavenLocal -PbintrayVersion=1.0.0-beta.xx
```
to publish the runtime library to your local maven repository. You can run the command multiple times using the same 
version. There is no need to use different version numbers. Android Studio will recognize the change to the dependency 
almost immediately.

**Your project**

Open `/yourproject/android/settings.gradle`, which should look like

```
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```
and comment or remove line 2 and 3 because we're going to use a dependency instead of including a subproject.
```
include ':app'
//include ':capacitor-android'
//project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```

Next open `/yourproject/android/app/build.gradle` 
 
comment or remove

```
implementation project(':capacitor-android')
``` 
and add 
```
implementation 'com.ionicframework.capacitor:capacitor-android:1.0.0-beta.xx'
```
Please replace the `1.0.0-beta.xx` with your current version.

Finally check if add `mavenLocal()` as Gradle repository somewhere in your project.

