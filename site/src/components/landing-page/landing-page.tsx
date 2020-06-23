import { Component, Element, h } from '@stencil/core';


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
      <div class="container">
        <section class="hero">
          <hgroup>
            <h1 id="action-call">The Native Bridge for Cross-Platform Web Apps</h1>
            <h3>
              Invoke Native SDKs on iOS, Android, and the Web with one code base.
              Optimized for Ionic Framework apps, or use with any web app framework.
            </h3>
            <stencil-route-link url="/docs/getting-started/">
              <button id="get-started">
                Get Started
              </button>
            </stencil-route-link>
            <h5>Supports</h5>
            <img alt="Apple, Android, PWA" src="/assets/img/supported-env.png"></img>
          </hgroup>
          <div class="hero-illustration">
            <img src="/assets/img/capacitor-hero.jpg"></img>
          </div>
        </section>

        <section class="points">
            <div class="points__item points__item--crossplatform">
              <h2>Cross Platform</h2>

              <p>
                Build web apps that run equally well on iOS, Android, and as Progressive Web Apps
            </p>
          </div>
          <div class="points__item points__item--nativeaccess">
            <h2>Native Access</h2>

            <p>
              Access the full Native SDK on each platform, and
              easily deploy to App Stores (and the web!)
            </p>
          </div>
          <div class="points__item points__item--simple">
            <h2>Use with Ionic</h2>
            <p>
              Capacitor provides native functionality for web apps, and is optimized
              for Ionic Framework
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
          <div class="points__item points__item--opensource">
            <h2>Open Source</h2>

            <p>
              Capacitor is completely open source (MIT) and maintained
              by <a href="http://ionicframework.com/">Ionic</a> and its community.
            </p>
          </div>
      </section>
    </div>,
    <newsletter-signup></newsletter-signup>
    ];
  }
}
