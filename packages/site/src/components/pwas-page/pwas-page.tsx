import { Component } from '@stencil/core';

@Component({
  tag: 'pwas-page',
  styleUrl: 'pwas-page.scss'
})
export class pwasPage {

  constructor() {
    document.title = `PWAs`;
  }

  render() {
    return (
      <div class="wrapper">
        <div class="pull-left">
          <site-menu />
        </div>

        <div class="pull-right">
          <h1>PWAs</h1>
          <h4>Building PWAs with Stencil</h4>

          <p>Want to build a PWA with Stencil? Follow these instructions to instantly have a production ready PWA.</p>

          <ul>
            <li>
              Run <code>git clone https://github.com/ionic-team/stencil-app-starter.git my-pwa</code> in your terminal.
          </li>
            <li>
              Run <code>npm run build</code>
            </li>
          </ul>

          And with just those two commands you now have a PWA that scores 100 on lighthouse right out of the box.

        <img src="/assets/img/pwa.png"></img>

          <h4>Under the hood</h4>

          <h5>Service Worker</h5>
          <p>
            When your run <code>npm run build</code> we automatically generate a Service Worker for you using <a href="https://workboxjs.org/">Workbox</a> that handles pre-caching your assets.
        </p>

          <stencil-route-link url="/docs/service-workers">
            Read more about Service Workers here.
        </stencil-route-link>

          <h5>Web Manifest</h5>
          <p>
            By default we include a Web Manifest that has all the neccessary entries to get the Add to Homescreen prompt. You can see that
          web manifest <a href="https://github.com/ionic-team/stencil-app-starter/blob/master/src/manifest.json">here</a>.
        </p>

          <h4>PWAs built with Stencil</h4>

          <ul>
            <li>
              <a href="https://stenciljs.com/">This site! Yep stenciljs.com is a PWA</a>
            </li>
            <li>
              <a href="https://corehacker-10883.firebaseapp.com/">Ionic HN as featured on <a href="https://hnpwa.com">HNPWA</a></a>
            </li>
            <li>
              <a href="https://stencilpaint-8ba3c.firebaseapp.com/">StencilPaint</a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
