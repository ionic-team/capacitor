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
          <h1>Announcing Capacitor</h1>
          <div>By <strong><a href="http://twitter.com/maxlynch">Max Lynch</a></strong> on <time>December 12th, 2017</time></div>
          <p>
            Today the <a href="http://ionicframework.com/">Ionic</a> team is excited excited to announce a new Private Preview open source project called Capacitor that makes
            it easier to build and deploy web apps on iOS, Android, Electron, and the web as a Progressive Web App,
            all while maximizing code reuse.
          </p>
          <p>
            Over the last few years, we've seen web technology proliferate on mobile like never before. Increasingly,
            teams are building apps using web technologies, and Progressive Web Apps are poised to bring the web
            to mobile in a huge way. As a
            company focused 100% on bringing the web to mobile, we're excited that teams are far more willing
            to build apps with web technology today than in years past.
          </p>
          <p>
            We think it could be even easier for web developers to use web standards to target all the platforms they care about, making
            it easy to build apps that run great in a native app
            environment on iOS, Android, and Electron, <i>and</i> on the web as a Progressive Web App.
          </p>
          <p>
            Capacitor is our attempt at doing just that.
          </p>
          <p>
            Capacitor is a set of tools and a web-to-native bridge that makes it possible to build powerful mobile apps with seamless
            native integration and Progressive Web App fallbacks. Capacitor features a simple Plugin API for building native functionality that is exposed through
            JavaScript to a web layer, along with easily mixing Native UI controls with web content
            to get the best of both worlds.
          </p>
          <p>
            When targeting native iOS or Android, Capacitor lets you control your entire native project without modifying it, enabling you to
            work in Xcode or Android Studio to easily add custom native code or Native UI if necessary. Exposing
            that code or those views to the web layer is as easy as connecting them to Capacitor in your iOS or Android project.
          </p>
          <p>
            Capacitor also bundles a set of core Native features out of the box, including Camera, Geolocation,
            Filesystem operations, and more. We want to provide 80% of what every app needs out of the box, while
            making it easy for the community to fill in the rest of the pieces.
          </p>
          <p>
            We are hopeful that Capacitor will enable teams with only web developers to build great apps, <i>and</i> teams with a mix of native developers and web developers will be able to work together to build truly cross-platform apps.
          </p>
          <p>
            Capacitor is under active development and is currently in a Private Preview with a small set of users while
            we continue to build and improve the project. We expect to have a public preview early 2018.
          </p>
          <p>
            Thanks,<br />
            The <a href="http://ionicframework.com/">Ionic</a> Team
          </p>
        </div>
      </div>,
      <newsletter-signup></newsletter-signup>
    ];
  }
}
