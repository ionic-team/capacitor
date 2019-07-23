---
title: CI/CD with Ionic Appflow
description: Learn how to incorporate a CICD process with your Capacitor app
url: /docs/guides/cicd-with-appflow
contributors:
  - dotnetkow
---

# CI/CD with Ionic Appflow

**Web Framework**: Ionic 4 + Angular  
**Platforms**: iOS, Android

[Ionic Appflow](https://ionicframework.com/appflow) is a Mobile DevOps solution for developers and teams building apps with Ionic. It helps increase agility and app quality while speeding up time-to-market by automating key phases of the development lifecycle. By generating and streamlining the native app build process, shipping real-time updates, and organizing approval workflows, your team is free to focus on the good stuff (innovation).

Appflow’s Capacitor support combines a modernized native app runtime with compelling DevOps features, resulting in a powerful solution for teams looking to build powerful Ionic mobile apps.

## Setting Up Capacitor

> You can skip this section if you have already created a Capacitor app.

First, we need to add Capacitor to our web-based project. For the best experience, we recommend an Ionic app. From a terminal, run these commands:

<strong>New Ionic Project</strong>
```shell
# Create a new Ionic "tabs" starter app
ionic start myApp tabs --capacitor
cd myApp
```

<strong>Existing Ionic Project</strong>
```shell
cd myApp
ionic integrations enable capacitor
```

<strong>Initialize Capacitor</strong>
```shell
# appName is name of the app, appId is domain identifier (ex: com.example.app)
npx cap init [appName] [appId]

# Build the project once
ionic build

# Add native platforms
npx cap add ios
npx cap add android
```

## Getting Started with Appflow

A free Ionic account is required to use Ionic Appflow. Besides Appflow access, you can connect with fellow Ionic community members on the Ionic Q&A Forum and be notified about the latest news updates, live events, and tutorials.

If you don't have an account yet, run:

```shell
ionic signup
```

Otherwise, check that you are logged into your account:

```shell
ionic login
```

Next, ensure that your Ionic app has been linked to Ionic Appflow. Run the `ionic link` command then follow the prompts to connect the app to Appflow.

If you don't have an app linked to Ionic Appflow, select `Create a new app on Ionic Appflow.` Otherwise, choose `Link an existing app on Ionic Appflow`.

## Deploy: Push Live Updates Remotely in Real-time

Ionic Appflow's Live Deploy feature lets you update the UI and business logic of your app remotely, in real-time. Push HTML, JS, and CSS updates or new images directly to your users without going through the app store to instantly fix bugs and/or ship new features.

Using the Live Deploy feature requires the installation of the Appflow SDK in your Ionic app:

```shell
ionic deploy add
```

Several prompts will walk you through the setup:

<strong>Appflow App ID:</strong> [Press Enter key to use the current Id or type in a different one]

<strong>Channel Name:</strong> [Enter desired channel name or “Master”]

<strong>Update Method:</strong> [Select “auto”, “background”, or “none.”] The "background" method is recommended. If an update is available, it will be downloaded and installed in the background while the user is using the older version. The next time they launch the app, the new version will be loaded.

After answering these prompts, the Deploy plugin (`cordova-plugin-ionic`, named as such since it was created long before Capacitor) is successfully installed into your Ionic project and various variables are automatically configured in the native iOS/Android projects for you.

To see the Deploy feature in action, there’s just a few more steps. Commit the changes to source control/Appflow:

```shell
# Perform another build then copy the web bits into the native project
ionic build && npx cap copy

git add .
git commit -m “added appflow deploy”
git push
```

Your Capacitor app is now ready to use Appflow Deploy. 

### Prepare a Live Update

Now for the fun part: shipping a live update to an Android device!

> Live Deploy works well with iOS devices too, but iOS (via Xcode) requires [additional set up steps](https://ionicframework.com/docs/installation/ios). It's a bit easier to just "plug and play" with Android, hence it's usage here.

If you're using the Ionic `tabs` starter app, open `tab1.page.html`, which will look similar to this:

```html
<ion-content>
    <ion-card class="welcome-card">
        <img src="/assets/shapes.svg" alt="" />
        <ion-card-header>
            <ion-card-subtitle>Get Started</ion-card-subtitle>
            <ion-card-title>Welcome to Ionic</ion-card-title>
        </ion-card-header>
        <!-- snip... -->
    </ion-card>
</ion-content>
```

As part of our live deploy update, let's change the image and some of the `ion-card` text content. First, head over to [Giphy](https://giphy.com/), select a GIF, copy the GIF link, then drop it into the `<img>`:

```html
<img src="https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif" />
```

Next, change the text of `ion-card-title` as well:

```html
<ion-card-title>Appflow update deployed!</ion-card-title>
```

Now, commit your changes to source control:

```shell
git add .
git commit -m "added a cool gif"
git push
```

[Open Appflow](https://dashboard.ionicframework.com) in a web browser, navigate to your app, then head to the `Deploy > Builds` tab. Next, click the `New web build` button:

![Appflow - New Web Build](/assets/img/docs/guides/cicd-appflow/appflow-new-web-build.png)

Ionic Appflow will list your brand new commit, so select "added a cool gif", assign the build to a channel (your preferred channel or "Master"), then click `Create Build`.

As the build progresses, you can watch its progress via the log output:

![Appflow - Start Web Build GIF](/assets/img/docs/guides/cicd-appflow/appflow-start-web-build.gif)

### View the Live Update on an Android Device

The local Android project still has the original version of our code, before the GIF and text changes were added, since we never copied the code into the native project. Let's have Appflow deploy the changes to our device.

First, connect an Android device to your computer and ensure that [Android Studio is installed](../getting-started/dependencies#android-development).

Next, open the Android project in Android Studio:

```shell
ionic cap open android
```

From within Android Studio, click the Run button to build and deploy the app to your Android device. After a brief moment, the app should display the newly added GIF and text changes. 🎉

The complete process we just ran through looks similar to this:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3gj54AewoC8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## What's Next?

In addition to Live Deploy functionality, Ionic Appflow offers [Package](https://ionicframework.com/docs/appflow/package/intro) (build native Android/iOS binaries in the cloud) and [Automations](https://ionicframework.com/docs/appflow/automation/intro) (automatically trigger Package builds and deploy them each time your team checks in new code). 

Combining these features enables you and your team to utilize Appflow's complete CI/CD superpowers. Common use cases include building [different versions of your app](https://ionicframework.com/docs/appflow/automation/environments) for development, staging, and production environments (that perhaps connect to different backend APIs), creating different white-labeled versions of your app, or installing [multiple versions of an app](https://ionicframework.com/docs/appflow/package/native-configs) on the same device.

How will your team use Appflow to supercharge their Capacitor apps?