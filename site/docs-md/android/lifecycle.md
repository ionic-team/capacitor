---
title: Android Lifecycle
description: Android Lifecycle
url: /docs/android/lifecycle
contributors:
  - mlynch
  - jcesarmobile
---

# Android Lifecycle

Understanding the Android Activity Lifecycle is crucial for building apps that act the way Android users expect.

This document attempts to explain the lifecycle as it pertains to Capacitor. For more information, the [Activity Lifecycle](https://developer.android.com/guide/components/activities/activity-lifecycle.html) reference on the official Android docs is the best resource out there.

## Handling App Restarts

Android apps often utilize other apps (or Activities) for features that are too complicated to include in their own app, such as camera or browser features.

In some cases, when a device is low on memory, launching a new Activity may cause your app to be killed in order to free up memory.

In this case, when the new Activity returns data back to your app, your app will want to show the user a state of the app that resumes what the user was just doing.
