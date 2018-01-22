# Building Progressive Web Apps

Capacitor has first-class support for Progressive Web Apps, making it easy to build an app that runs natively on iOS and Android, but also on the web as a mobile web app or "Progressive Web App."

## What is a Progressive Web App?

Put simply, a Progressive Web App (PWA) is a web app that uses modern web capabilities to deliver an app-like experience to users. These apps are deployed to traditional web servers, are accessible through URLs, and can be indexed by search engines.

A Progressive Web App is, for all practical purposes, just another term for a website that has been optimized for mobile performance and that utilizes newly available Web APIs to deliver features that are similar to a traditional native app, such as push notifications and offline storage.

## Capacitor and Progressive Web Apps

Capacitor has first-class support for Progressive Web Apps *and* native apps. That means that Capacitor's plugin bridge supports running in either a native context or in the web, with many core plugins available *in both contexts* with the exact same API and calling conventions.

This means you'll use `@capacitor/core` as a dependency for both your native app *and* your Progressive Web App, and Capacitor will seamlessly call web code when required and native code when available.

Additionally, Capacitor offers a number of utilities for querying the current platform to provide customized experiences when running natively or on the web.

## Adding Progressive Web App Support to your app

Adding PWA support to any existing frontend project is easy. Just add an App Manifest file and configure a service worker:

### App Manifest

First, you'll need an [App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) file (`[manifest.json](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json)`)
that sits alongside your `index.html` file and provides metadata about your app, such as its name, theme colors, and icons. This information will be used
when your app is installed on the home screen, for example.

### Service Worker

Next, in order to send push notifications and store data offline, a [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) will
enable your web app to proxy network requests and perform background tasks needed to process and sync data.

Service Workers are powerful, but complicated. Generally, writing them from scratch is not recommended. Instead, take a look at tools like [Workbox](https://developers.google.com/web/tools/workbox/) that
provide common Service Worker recipes that you can easily incorporate into your app.

Read more about using Service Workers, including how to register them, on the [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) page on MDN.

## Progressive Web App Performance

Progressive Web Apps are judged by serveral performance standards, including [Time to Interactive](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive) and [First Meaningful Paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint). 

Follow the [Progressive Web App Checklist](https://developers.google.com/web/progressive-web-apps/checklist) before going live, and use [Lighthouse](https://developers.google.com/web/tools/lighthouse/) to audit and test your app.

If you're struggling to meet Progressive Web App performance standards with your existing frontend stack, take a look at [Ionic Framework](http://ionicframework.com/) version 4 (in beta at the time of this writing) or greater as an option for getting fast PWA support with nearly zero configuration. Ionic 4.x or above is a web component library that works in several popular frontend frameworks, not just Angular.