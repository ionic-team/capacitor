import { Component } from '@stencil/core';

@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss'
})
export class BlogPage {
  constructor() {
    document.title = `Avocado Blog - Build cross-platform apps with the web`;
  }

  render() {
    return (
      <div id="blog" class="wrapper">
        <div class="post">
          <h2>Announcing Avocado</h2>
          <div>By <a href="http://twitter.com/maxlynch">Max Lynch</a> on <time>December 12th, 2017</time></div>
          <p>
            Today the Ionic team is excited excited to announce a new project called Avocado in Private Preview focusing on making
            it easier to build and deploy web apps on iOS, Android, Electron, and the web as a Progressive Web App,
            all while maximizing code reuse.
          </p>
          <p>
            Over the last few years, we've seen web technology proliferate on mobile like never before. As a 
            company focused 100% on bringing the web to mobile, we're excited that teams are far more willing
            to build apps with web technology today than in years past.
          </p>
          <p>
            Our vision for the future involves building web apps that run great in a native app
            environment on iOS, Android, and Electron, but can be deployed just as easily on the web as a Progressive Web App.
          </p>
          <p>
            Avocado features a simple Plugin API for building native functionality that is exposed through
            JavaScript to a web layer, along with easily mixing Native UI controls with web content
            to get the best of both worlds.
          </p>
          <p>
            When targeting native iOS or Android, Avocado lets you control your entire native project without modifying it, enabling you to
            work in Xcode or Android Studio to easily add custom native code or Native UI if necessary. Exposing
            that code or those views to the web layer is as easy as connecting them to Avocado in your iOS or Android project.
          </p>
          <p>
            This means teams with only web developers will be able to build great apps, <i>and</i> teams with a mix of native developers and web developers will be able to work together to build truly cross-platform apps.
          </p>
          <p>
          </p>
        </div>
      </div>
    );
  }
}
