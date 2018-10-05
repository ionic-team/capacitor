# PWA Elements

Some Capacitor plugins, such as `Camera`, have web-based UI available when not running natively. For example, calling `Camera.getPhoto()` will 
load a responsive photo-taking experience when running on the web or electron:

<img src="/assets/img/docs/pwa-elements.png" style="height: 200px" />

This UI is implemented using a subset of the [Ionic Framework](http://ionicframework.com/) web components. Due to the magic of Shadow DOM, these components should not conflict
with your own UI whether you choose to use Ionic or not.

## Installation

To enable these controls, you must add `@ionic/pwa-elements` to your app. 

A typical installation involves adding the following script tag to the `<head>` of the `index.html` for your app:

```
<script src="https://unpkg.com/@ionic/pwa-elements@1.0.0/dist/ionicpwaelements.js"></script>
```

Please replace `1.0.0` with the latest version of the package on NPM: [@ionic/pwa-elements](https://www.npmjs.com/package/@ionic/pwa-elements).