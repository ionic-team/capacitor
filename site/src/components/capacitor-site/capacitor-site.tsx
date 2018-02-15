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
              url="/demos"
              component="demos-page"
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
                console.log('Showing api page', page);
                return (
                  <document-component pages={[page]} />
                );
              }}
            />

            <stencil-route
              url="/resources"
              component="resources-page"
            />

          </stencil-router>
          {/*</div>*/}
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
            {/*
            <a class="svg-button" id="stencil-repo" href="https://github.com/ionic-team/stencil" target="_blank" rel="noopener"
              title="Open the stencil site repository on github">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 512 512"
              >
                <path d="M256 32C132.3 32 32 135 32 261.7c0 101.5 64.2 187.5 153.2 218l3.8.3c8.3 0 11.5-6 11.5-11.4l-.3-39c-8.4 1.8-16 2.6-22.6 2.6-43 0-53-33.5-53-33.5-10-26.5-24.8-33.6-24.8-33.6-19.5-13.6 0-14 1.4-14 22.6 2 34.4 23.8 34.4 23.8 11.2 19.6 26.2 25 39.6 25 10.5 0 20-3.3 25.6-6 2-14.7 7.8-24.8 14.2-30.6-49.7-5.8-102-25.5-102-113.5 0-25 8.7-45.6 23-61.6-2.3-5.7-10-29 2.2-60.7 0 0 1.6-.5 5-.5 8 0 26.4 3 56.6 24 18-5 37-7.5 56-7.6 19 0 38.3 2.6 56.2 7.7 30.2-21 48.5-24.2 56.6-24.2 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.2 23 36.7 23 61.7 0 88.2-52.4 107.6-102.3 113.3 8 7 15.2 21 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3 11.5 11.4 11.5 1.2 0 2.6 0 4-.4 89-30.4 153.2-116.5 153.2-218C480 135 379.7 32 256 32z" />
              </svg>
            </a>
            */}
            <a class="svg-button"
              id="capacitor-twitter"
              href="https://twitter.com/getcapacitor"
              target="_blank"
              rel="noopener"
              title="Open the Capacitor account on twitter"
              style={{fill: 'white'}}
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 512 512">
                <path d="M492 109.5c-17.4 7.7-36 13-55.6 15.3 20-12 35.4-31 42.6-53.6-18.7 11-39.4 19.2-61.5 23.5-17.7-19-43-30.7-70.7-30.7-53.5 0-96.8 43.4-96.8 97 0 7.5.8 15 2.5 22-80.5-4-152-42.6-199.6-101.3-8.4 14.3-13.2 31-13.2 48.7C39.8 164 57 193.7 83 211c-16-.3-31-4.7-44-12v1.2c0 47 33.4 86 77.7 95-8 2.2-16.7 3.4-25.5 3.4-6.2 0-12.3-.6-18.2-1.8 12.3 38.5 48 66.5 90.5 67.3-33 26-75 41.6-120.3 41.6-7.8 0-15.5-.5-23-1.4C62.7 432 113.6 448 168 448 346.7 448 444 300.3 444 172.2c0-4.2 0-8.4-.3-12.5 19-13.7 35.3-30.7 48.3-50.2z" />
              </svg>
            </a>
            {/*
            <a class="svg-button" id="cap-forum" href="https://avocadojs.herokuapp.com/" target="_blank" rel="noopener"
              title="Join the Capacitor slack">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 512 512"
              >
                <path d="M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" />
                <path d="M213.6 236.2l64-21.4 20.7 61.8-64 21.4z" />
                <path d="M476 190C426.3 25 355-13.4 190 36S-13.4 157 36 322s121 203.4 286 154 203.4-121 154-286zm-83.4 107l-31 10.5 10.6 32.2c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.5-7-23-17l-10.6-32-64 21.4L261 377c4.2 13-2.7 27.2-15.7 31.5-2.7.8-5.8 1.5-8.4 1.2-10-.4-19.7-7-23-17l-11-32.3-31 10.3c-2.7.8-5.8 1.5-8.4 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-20.6-61.7-31 10.4c-2.8.8-6 1.5-8.5 1.2-10-.5-19.6-7-23-17-4.2-13 2.7-27.2 15.7-31.5l31-10.4-11-32c-4-13 2.8-27.2 15.8-31.5 13-4.2 27.2 2.7 31.5 15.7l10.7 32.2 64-21.5-10.6-32.3c-4.2-13 2.7-27.2 15.7-31.5 13-4.2 27.3 2.7 31.6 15.7l10.7 32 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4 13-2.8 27.2-15.8 31.5l-31 10.3 20.6 61.8 31-10.3c13-4.2 27.3 2.7 31.6 15.7 4.2 13.2-2.7 27.4-15.8 31.7z" />
              </svg>
            </a>
            */}
          </div>
        </div>
      </footer>
    ];
  }
}
