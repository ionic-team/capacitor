import { Component, Element } from '@stencil/core';


@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss'
})
export class LandingPage {

  @Element() el: Element;

  constructor() {
    let root: any = document.querySelector('capacitor-site');
    root.isLandingPage = true;
    document.title = `Capacitor: Universal Web Applications`;
  }

  componentDidUnload() {
    let root: any = document.querySelector('capacitor-site');
    root.isLandingPage = false;
  }

  render() {
    return [
      // <div class="announcement container">
      //   <stencil-route-link url="/blog/" >
      //     <span class="pill">New</span>
      //     <span class="message">
      //       Announcing Capacitor 1.0.0 Beta
      //     </span>
      //     <span class="cta">
      //       Read Post
      //       <app-icon name="caret-right"></app-icon>
      //     </span>
      //   </stencil-route-link>
      // </div>,

      <div class="container">
        <section class="hero">
          <hgroup>
            <h1 id="action-call">Build native mobile and desktop apps with the web</h1>
            <h3>
              Cross-platform runtime that makes it easy to build apps that run natively on iOS, Android, Electron, and the web - using HTML, JS, and CSS.
            </h3>
            <stencil-route-link url="/docs/getting-started/">
              <button id="get-started">
                Get Started
              </button>
            </stencil-route-link>
            <h5>Supports</h5>
            <img src="/assets/img/supported-env.png"></img>
          </hgroup>
          <div class="hero-illustration">
            <img src="/assets/img/capacitor-hero.jpg"></img>
          </div>
        </section>

        <section class="points">
            <div class="points__item points__item--crossplatform">
              <h2>Cross Platform</h2>

              <p>
                Build web apps that run equally well on iOS, Android,
                Electron, and as Progressive Web Apps
            </p>
          </div>
          <div class="points__item points__item--nativeaccess">
            <h2>Native Access</h2>

            <p>
              Access the full Native SDK on each platform, and
              easily deploy to App Stores (and the web!)
            </p>
          </div>
          <div class="points__item points__item--opensource">
            <h2>Open Source</h2>

            <p>
              Capacitor is completely open source (MIT) and maintained
              by <a href="http://ionicframework.com/">Ionic</a> and its community.
            </p>
          </div>
          <div class="points__item points__item--webnative">
            <h2>Web Native</h2>
            <p>
              Build apps with standardized web technologies that will work for decades, and
              easily reach users on the app stores <i>and</i> the mobile web.
            </p>
          </div>
          <div class="points__item points__item--extensible">
            <h2>Extensible</h2>

            <p>
              Easily add custom native functionality with a simple Plugin API, or
              use existing Cordova plugins with our compatibility layer.
            </p>
          </div>
          <div class="points__item points__item--simple">
            <h2>Simple</h2>
            <p>
              Focus on what you want to do, not how. Capacitor turns complex, proprietary Native APIs into simple JS calls.
            </p>
          </div>
      </section>
    </div>,
    <newsletter-signup></newsletter-signup>
    ];
  }
}
