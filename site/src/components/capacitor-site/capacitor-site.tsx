import '@stencil/router';
import { Component, Prop, Element, Listen, State, h } from '@stencil/core';
import { LocationSegments, RouterHistory } from '@stencil/router';
import SiteProviderConsumer, { SiteState } from '../../global/site-provider-consumer';

@Component({
  tag: 'capacitor-site',
  styleUrl: 'capacitor-site.scss'
})
export class App {
  history: RouterHistory = null;
  elements = [
    'site-header',
    'site-menu',
    'app-burger',
    '.root'
  ];

  @Element() el: HTMLElement;

  @Prop() isLandingPage = false;

  @State() isLeftSidebarIn: boolean;

  @Listen('window:resize')
  handleResize() {
    requestAnimationFrame(() => {
      if (window.innerWidth > 768 && this.isLeftSidebarIn) {
        this.isLeftSidebarIn = false;
        document.body.classList.remove('no-scroll');
        this.elements.forEach((el) => {
          this.el.querySelector(el).classList.remove('left-sidebar-in');
        });
      }
    });
  }

  @Listen('burgerClick', { target: 'body' })
  @Listen('leftSidebarClick', { target: 'body' })
  handleToggle() {
    if (window.innerWidth <= 768) this.toggleLeftSidebar();    
  }

  setHistory = ({ history }: { history: RouterHistory }) => {
    if (!this.history) {
      this.history = history;
      this.history.listen((location: LocationSegments) => {
        (window as any).gtag('config', 'UA-44023830-42', { 'page_path': location.pathname + location.search });
      });
    }
  }

  componentDidLoad() {
    this.isLeftSidebarIn = false;
  }

  toggleLeftSidebar(){
    if (this.isLeftSidebarIn) {
      this.isLeftSidebarIn = false;
      document.body.classList.remove('no-scroll');
      this.elements.forEach((el) => {
        this.el.querySelector(el).classList.remove('left-sidebar-in');
        this.el.querySelector(el).classList.add('left-sidebar-out');
      });
    } else {
      this.isLeftSidebarIn = true;
      document.body.classList.add('no-scroll');
      this.elements.forEach((el) => {
        this.el.querySelector(el).classList.add('left-sidebar-in');
        this.el.querySelector(el).classList.remove('left-sidebar-out');
      });
    }
  }

  hostData() {
    return {
      class: {
        'landing-page': this.isLandingPage
      }
    }
  }

  render() {
    
    const siteState: SiteState = {
      isLeftSidebarIn: this.isLeftSidebarIn,
      toggleLeftSidebar: this.toggleLeftSidebar
    }
    const footerClass = this.isLandingPage ? 'footer-landing' : '';

    return (
      <SiteProviderConsumer.Provider state={siteState}>
        <div id="main-div">
          <site-header />
          <div class="app root">
            <stencil-router scrollTopOffset={0}>
              <stencil-route style={{ display: 'none' }} routeRender={this.setHistory}/>
              <stencil-route-switch scrollTopOffset={0}>

                <stencil-route
                  url="/"
                  component="landing-page"
                  exact={true}
                />

                {/* <stencil-route
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
                  url="/docs/cordova/:pageName?"
                  routeRender={(props: { [key: string]: any }) => {
                    const page = props.match.params.pageName || 'index';
                    return (
                      <document-component pages={[`cordova/${page}.html`]} />
                    );
                  }}
                />
  
                <stencil-route
                  url="/docs/guides/:pageName?"
                  routeRender={(props: { [key: string]: any }) => {
                    const page = props.match.params.pageName || 'index';
                    return (
                      <document-component pages={[`guides/${page}.html`]} />
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
  
                <stencil-route
                  url="/docs/community/:pageName?"
                  routeRender={(props: { [key: string]: any }) => {
                    const page = props.match.params.pageName || 'index';
                    return (
                      <document-component pages={[`community/${page}.html`]} />
                    );
                  }}
                /> */}

                <stencil-route url="/docs/" exact={true} routeRender={() => (
                  <document-component page='/docs/'></document-component>
                )}/>

                <stencil-route url="/enterprise/" exact={true} routeRender={() => (
                  <capacitor-enterprise />
                )}/>

                <stencil-route url="/docs/:pageName*" routeRender={({ match }) => (
                  <document-component page={match.url}></document-component>
                )}/>
              </stencil-route-switch>
            </stencil-router>
          </div>
        </div>

        <footer class={footerClass}>
          <div class="container">
            <div id="open-source">
              <a href="http://ionicframework.com/" title="IonicFramework.com" rel="noopener">
                <div class="ionic-oss-logo"></div>
              </a>
              <p>Released under <span id="mit">MIT License</span> | Copyright @ {(new Date()).getFullYear()} Drifty Co.</p>
            </div>

            <div id="footer-icons">
              <iframe
                title="Github Star Count" 
                class="star-button"
                src="https://ghbtns.com/github-btn.html?user=ionic-team&repo=capacitor&type=star&count=true"
                frameBorder="0"
                scrolling="0"
                width="100px"
                height="20px"
              ></iframe>

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
      </SiteProviderConsumer.Provider>
    );
  }
}
