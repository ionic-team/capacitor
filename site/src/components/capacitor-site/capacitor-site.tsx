import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'capacitor-site',
  styleUrl: 'capacitor-site.scss'
})
export class App {
  @Prop() isLandingPage = false;

  hostData() {
    return {
      class: {
        'landing-page': this.isLandingPage
      }
    }
  }

  render() {
    const footerClass = this.isLandingPage ? 'footer-landing' : '';

    return [
      <div id="main-div">
        <site-header />
        <div class="app">
          <stencil-router>

            <stencil-route
              url="/"
              component="landing-page"
              exact={true}
            />

            <stencil-route
              url="/blog"
              component="blog-page"
            />

            <stencil-route
              url="/docs/"
              exact={true}
              routeRender={(_props: { [key: string]: any }) => {
                return (
                  <document-component pages={['index.html']} />
                );
               }}
              />

            <stencil-route
              url="/docs/getting-started/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`getting-started/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/basics/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`basics/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/ios/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`ios/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/android/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`android/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/electron/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`electron/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/web/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`web/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/plugins/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                const page = props.match.params.pageName || 'index';
                return (
                  <document-component pages={[`plugins/${page}.html`]} />
                );
              }}
            />

            <stencil-route
              url="/docs/apis/:pageName?"
              routeRender={(props: { [key: string]: any }) => {
                let page = 'apis/index.html';
                const pageName = props.match.params.pageName;
                if(pageName) {
                  page = `apis/${pageName}/index.html`
                }
                return (
                  <document-component pages={[page]} />
                );
              }}
            />

          </stencil-router>
        </div>
      </div>,

      <footer class={footerClass}>
        <div class="container">
          <div id="open-source">
            <a href="http://ionicframework.com/" title="IonicFramework.com" rel="noopener">
              <div class="ionic-oss-logo"></div>
            </a>
            <p>Released under <span id="mit">MIT License</span> | Copyright @ 2017 Drifty Co.</p>
          </div>

          <div id="footer-icons">
            <iframe class="star-button" src="https://ghbtns.com/github-btn.html?user=ionic-team&repo=capacitor&type=star&count=true" frameBorder="0" scrolling="0" width="100px" height="20px"></iframe>

            <a class="svg-button"
              id="capacitor-twitter"
              href="https://twitter.com/getcapacitor"
              target="_blank"
              rel="noopener"
              title="Open the Capacitor account on twitter"
              style={{fill: 'white'}}
              >
              <app-icon name="twitter"></app-icon>
            </a>
            <a class="svg-button" id="cap-forum" href="https://getcapacitor.herokuapp.com/" target="_blank" rel="noopener"
              title="Join the Capacitor slack">
              <app-icon name="slack"></app-icon>
            </a>
          </div>
        </div>
      </footer>
    ];
  }
}
