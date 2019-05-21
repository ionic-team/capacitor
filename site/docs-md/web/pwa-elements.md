---
title: PWA Elements
description: Using PWA Elements
url: /docs/pwa-elements
contributors:
  - dotnetkow
  - mlynch
---

# PWA Elements

Some Capacitor plugins, such as `Camera`, have web-based UI available when not running natively. For example, calling `Camera.getPhoto()` will 
load a responsive photo-taking experience when running on the web or electron:

<img src="/assets/img/docs/pwa-elements.png" style="height: 200px" />

This UI is implemented using a subset of the [Ionic Framework](http://ionicframework.com/) web components. Due to the magic of Shadow DOM, these components should not conflict
with your own UI whether you choose to use Ionic or not.

## Installation

To enable these controls, you must add `@ionic/pwa-elements` to your app. 

A typical installation involves either adding the following script tag to the `<head>` of the `index.html` for your app:

```html
<script src="https://unpkg.com/@ionic/pwa-elements@latest/dist/ionicpwaelements.js"></script>
```

Or by installing and then importing from `@ionic/pwa-elements`:

```bash
npm install @ionic/pwa-elements
```

```ts
import '@ionic/pwa-elements';
```

