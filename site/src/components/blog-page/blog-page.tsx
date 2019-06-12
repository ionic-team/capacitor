import { Component } from '@stencil/core';

@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss'
})
export class BlogPage {
  constructor() {
    document.title = `Capacitor Blog - Build cross-platform apps with the web`;
  }

  render() {
    return [
      <div id="blog" class="wrapper">
        <div class="post container">
          <h1>Announcing Capacitor 1.0.0 Beta</h1>
          <div>By <strong><a href="http://twitter.com/maxlynch">Max Lynch</a></strong> on <time>May 8th, 2018</time></div>
          <p>
            Today we are incredibly excited to announce the first beta release of Capacitor, a new project
            by the team behind <a href="http://ionicframework.com/">Ionic Framework</a> to build a better future for
            hybrid apps by helping them run on more platforms, access native functionality more easily, and
            reduce the complexity of managing native projects.
          </p>
          <p>
            Capacitor is a simple but powerful native mobile web app runtime, helping developers build standards-compliant
            web apps that run natively on iOS, Android, Desktop, and the web as a Progressive Web App, all with one shared code base.
          </p>
          <p>
            At Ionic, we've worked with thousands of teams building mission critical apps with the web platform. That
            experience has given us a fresh perspective on how to improve one of the most important pieces of
            what makes an app an app: how it interfaces with the native platform it runs on.
          </p>

          <h2>How does Capacitor work?</h2>
          <p>
            At the core, Capacitor is a web-to-native "bridge" that lets JavaScript and web content access native functionality and UI (and vice versa). Capacitor comes
            with tooling to help create projects for each platform you're targeting, along with a plugin API for extending and exposing native functionality to your web code. Finally,
            Capacitor comes with a middleware layer that enables your code to run both on native platforms *and* on the web as a Progressive Web App, all with the same code.
          </p>
          <p>
            Capacitor solves a similar problem to Cordova, so Capacitor will replace Cordova in a typical hybrid app, while providing backwards compatibility with most
            existing Cordova plugins. Capacitor and Ionic Framework work together, with Capacitor providing Native SDK access and basic native tooling, and Ionic Framework providing the
            cross-platform UI you've come to know and love.
          </p>

          <h2>How does Capacitor compare to X?</h2>
          <p>
            Capacitor is most similar to Cordova, but has taken a few different approaches to hybrid app development. First, Capacitor
            has much less tooling for native project management. Instead, Capacitor enables you to check your native projects into source
            control and manage them as a source asset. This means fewer Capacitor-specific tools that can break in unexpected ways,
            and an easier escape-hatch for adding native code or working with existing native development teams/libraries. For those used to
            doing everything from the Cordova CLI, expect to change to spending more time in the platform-specific IDE for testing/running (such as Xcode, Android Studio, etc.)
          </p>
          <p>
            Compared to React Native, Native Script, Flutter, and the many other cross-platform options focused on Native UI, Capacitor is web-native, and enables
            developers to build one app that runs just as well in the app stores as it does on Electron and on the web as a Progressive Web App. Perfect for teams
            that continue to support multi-screen environments or want to use pure web standards to build their apps.
          </p>

          <h2>What's next?</h2>
          <p>
            With Capacitor entering beta, we are working hard towards 1.0, production-ready status. We will soon be integrating Capacitor into
            the Ionic CLI, and encouraging Ionic developers to use it in place of Cordova.
          </p>

          <h2>What's next?</h2>
          <p>
            To get started, visit the <a href="https://capacitor.ionicframework.com/docs/getting-started/">Getting Started</a> portion of the <a href="https://capacitor.ionicframework.com/">Capacitor Docs</a>.
          </p>
          <p>
            If you need help as you try it out, join us on the <a href="https://forum.ionicframework.com">Capacitor Forum</a> or <a href="http://getcapacitor.herokuapp.com/">Slack Community</a>.
          </p>
          <p>
            From all of us at <a href="http://ionicframework.com/">Ionic</a>, thanks for trying Capacitor!
          </p>
        </div>
      </div>,
      <newsletter-signup></newsletter-signup>
    ];
  }
}
