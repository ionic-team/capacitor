---
title: Updating Your Capacitor Android Project
description: Updating Your Capacitor Android Project
url: /docs/android/updating
contributors:
  - mlynch
  - jcesarmobile
---

# Updating Your Capacitor Android Project

<p class="intro">Occasionally, you'll need to make Capacitor updates to your Android app, including updating the version of Capacitor used in your app, or using new ways of interfacing with Capacitor inside of your Android codebase.</a>

## Updating Capacitor Android Library

To update the version of @capacitor/android used in your app, just npm install latest version:

```bash
npm install @capacitor/android@latest
```

Then from Android Studio click the "Sync Project with Gradle Files" button.

## Updating Android Project

To update the base structure of your Android project, view the [android-template](https://github.com/ionic-team/capacitor/tree/master/android-template) project in the Capacitor repo, under the tag corresponding to the latest stable release of Capacitor. The core project is kept simple on purpose: it shouldn't take much time to see what is different from the core project and your project.

### From 1.0.0 to 1.1.0

Recommended change:

* Update `.gitignore` file inside `android` folder with [this changes](https://github.com/ionic-team/capacitor/commit/e27586780baed231c09f2737bb94a9338aab5a03#diff-15c65f143d85c95277307da1bdd0528e)

### From <= 1.3.0 to 1.4.0

Recommended change:

* Update `strings.xml` file inside `android/app/src/main/res/values/` folder with [this change](https://github.com/ionic-team/capacitor/commit/ed6647b35a8da08d26a7ff13cc9f4fd918b923a0#diff-15c65f143d85c95277307da1bdd0528e)

### From <= 1.5.1 to 2.0.0

Mandatory change:

* Use Android X

  Capacitor 2.0 uses Android X for Android support library dependencies as recommended by Google, so the native project needs to be updated to use Android X too.

  From Android Studio do `Refactor -> Migrate to AndroidX`. Then click on `Migrate` button and finally click on `Do Refactor`.

  If using Cordova or Capacitor plugins that don't use Android X yet, you can use [jetifier](https://www.npmjs.com/package/jetifier) tool to patch them.

```bash
npm install jetifier
npx jetifier
```

  To run it automatically after every package install, add `"postinstall": "jetifier"` in the `package.json`.

Recommended changes:

* Create common variables

  Create a `android/variables.gradle` file with this content

  ```
  ext {
    minSdkVersion = 21
    compileSdkVersion = 29
    targetSdkVersion = 29
    androidxAppCompatVersion = '1.1.0'
    androidxCoreVersion =  '1.2.0'
    androidxMaterialVersion =  '1.1.0-rc02'
    androidxBrowserVersion =  '1.2.0'
    androidxLocalbroadcastmanagerVersion =  '1.0.0'
    firebaseMessagingVersion =  '20.1.2'
    playServicesLocationVersion =  '17.0.0'
    junitVersion =  '4.12'
    androidxJunitVersion =  '1.1.1'
    androidxEspressoCoreVersion =  '3.2.0'
    cordovaAndroidVersion =  '7.0.0'
  }
  ```

  In `android/build.gradle` file, add `apply from: "variables.gradle"` as shown [here](https://github.com/ionic-team/capacitor/blob/master/android-template/build.gradle#L18).

* Use common variables

  If you created the `variables.gradle` file, update your project to use them. In the `android/app/build.gradle` file, change:
  - `compileSdkVersion 28` to `compileSdkVersion rootProject.ext.compileSdkVersion`
  - `minSdkVersion 21` to `minSdkVersion rootProject.ext.minSdkVersion`
  - `targetSdkVersion 28` to `targetSdkVersion rootProject.ext.targetSdkVersion`
  - `implementation 'androidx.appcompat:appcompat:1.0.0'` to `implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"`
  - `testImplementation 'junit:junit:4.12'` to `testImplementation "junit:junit:$junitVersion"`
  - `androidTestImplementation 'androidx.test.ext:junit:1.1.1'` to `androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"`
  - `androidTestImplementation 'androidx.test.espresso:espresso-core:3.1.0'` to `androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"`

  Note that they use double quote instead of single quote now, that's required for variables to work.

* Android Studio Plugin Update Recommended

  When you open the Android project in Android Studio, a `Plugin Update Recommended` message will appear. Click on `update`. It will tell you to update Gradle plugin and Gradle. Click `Update` button.

  You can also manually update the Gradle plugin and Gradle.
  
  To manually update Gradle plugin, edit `android/build.gradle` file. Change `classpath 'com.android.tools.build:gradle:3.3.2'` to `classpath 'com.android.tools.build:gradle:3.6.1'`.

  To manually update Gradle, edit `android/gradle/wrapper/gradle-wrapper.properties`. Change `gradle-4.10.1-all.zip` to `gradle-5.6.4-all.zip`.

* Update Google Services plugin

  In `android/build.gradle` file, change `classpath 'com.google.gms:google-services:4.2.0'` to `classpath 'com.google.gms:google-services:4.3.3'`.

* Change configChanges to avoid app restarts

  In `android/app/src/main/AndroidManifest.xml` file, add `|smallestScreenSize|screenLayout|uiMode` in the activity `android:configChanges` attribute.

* Add caches folder to FileProvider file paths to avoid permission error on editing gallery images.

  In `android/app/src/main/res/xml/file_paths.xml` add `<cache-path name="my_cache_images" path="." />`.

For API changes check the [Release Notes](https://github.com/ionic-team/capacitor/releases/tag/2.0.0)
