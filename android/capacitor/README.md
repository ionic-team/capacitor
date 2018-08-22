# Capacitor Android runtime [![Download](https://img.shields.io/bintray/v/ionic-team/capacitor/capacitor-android.svg)](https://bintray.com/ionic-team/capacitor/capacitor-android/_latestVersion) [![Twitter Follow](https://img.shields.io/twitter/follow/getcapacitor.svg?style=social&label=Follow&style=flat-square)](https://twitter.com/getcapacitor)
 
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

### Testing

If you want to integration test your runtime changes in your own Capacitor project there are two ways to do so.

**1) Change path**

In your project open `/android/settings.gradle`, which should look like

```
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```
and comment these lines
```
//include ':capacitor-android'
//project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
```
**Important** Sync your project now!

After the sync has finished, uncomment the lines and change the path in `new File()` from
```
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
```
to
```
project(':capacitor-android').projectDir = new File('../../CLONED_CAP_REPO_DIR/android/capacitor/')
```

The path now points to your local android runtime clone. If you simply cloned Capacitor the placeholder `CLONED_CAP_REPO_DIR` is `capacitor` 
and the full path would be `'../../capacitor/android/capacitor/'`.

The result should look like
```
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../../capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```

Now sync gradle again! 

You should be able to debug the project either on the emulator or on device.

**Important note:** If you would have just changed the path (without syncing in between) Gradle would most propably have 
done strange things, which causes your build to fail. No idea why!

**2) Publish to maven local**

To publish the runtime lib to your local maven repository run the below command in `CLONED_CAP_REPO_DIR/android/capacitor`.
```
./gradlew publishToMavenLocal -PbintrayVersion=1.0.0-beta.xx
```
You might have to manually grant execute permissions if you running this command on macOS or Linux.

Replace the `1.0.0-beta.xx` with your actual version number. 

*Note:* You can run the command multiple times using the same version. There is no need to use different version numbers 
each time you make a change. Android Studio will recognize the change to the dependency almost immediately.


Then change to your Capacitor project and open `android/settings.gradle`, which should look like
```
include ':app'
include ':capacitor-android'
project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```
and comment or remove the lines including `:capacitor-android` because we're going to use a dependency instead of including a subproject.

The result should look like
```
include ':app'
// while contributing to capacitor comment the next two lines. We use locally published maven dependencies.
//include ':capacitor-android'
//project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor/')
include ':capacitor-android-plugins'
project(':capacitor-android-plugins').projectDir = new File('../node_modules/@capacitor/cli/assets/capacitor-android-plugins/')

apply from: 'capacitor.settings.gradle'
```

Next open `android/app/build.gradle` and replace
```
implementation project(':capacitor-android')
``` 
with
```
implementation 'com.ionicframework.capacitor:capacitor-android:1.0.0-beta.xx'
```

Once again please replace the `1.0.0-beta.xx` with your current version.

After that open `android/build.gradle`, find the `allprojects` section and add `mavenLocal()` so it looks like
```
allprojects {
  repositories {
    google()
    jcenter()
    mavenLocal()
  }
}
```

If you added the Android platform (`npx cap add android`) with Capacitor version `beta.7` or later it should already be there.

Finally sync your project in Android Studio and start testing your changes.

