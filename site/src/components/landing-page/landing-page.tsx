import { Component, Element } from '@stencil/core';


@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss'
})
export class LandingPage {

  @Element() el: Element;

  constructor() {
    let root: any = document.querySelector('avocado-site');
    root.isLandingPage = true;
    document.title = `Capacitor: Universal Web Applications`;
  }

  componentDidUnload() {
    let root: any = document.querySelector('avocado-site');
    root.isLandingPage = false;
  }

  render() {
    return (
      <div>

        <main>
          <div class="row">
            <div class="col">
              <h1 id="action-call">Build cross platform mobile apps with JavaScript and the Web</h1>
              <div id="action-more">
                Native Progressive Web Apps with HTML, CSS, and JavaScript
                <br />
                <br />
                <b>Coming early 2018. Sign up below for updates</b>
              </div>
              <section id="buttons">
                <form id="cta-form" action="https://codiqa.createsend.com/t/t/s/flhuhj/" method="post">
                  <div class="input-with-button">
                    <input type="email" placeholder="Email address" id="fieldEmail" name="cm-flhuhj-flhuhj" required />
                    <button type="submit">Notify me</button>
                  </div>
                </form>
                {/*
                <stencil-route-link url="/docs/getting-started">
                  <button id="get-started">
                    Get Started
                  </button>
                </stencil-route-link>

                <stencil-route-link url="/docs/intro">
                  <button id="learn-more">
                    Learn More
                  </button>
                </stencil-route-link>
                */}
              </section>
            </div>
            <div class="col" id="landing-cta-offset"></div>
            <div class="col" id="landing-cta-image"></div>
          </div>
        </main>

        <section id="three-points">
          <div class="point-card">
            <h2>Cross Platform</h2>

            <p>
              Build web apps that run equally well on iOS, Android,
              Electron, and as Progressive Web Apps
          </p>
        </div>
        <div class="point-card">
          <h2>Native Access</h2>

          <p>
            Access the full Native SDK on each platform, and
            easily deploy to App Stores (and the web!)
          </p>
        </div>
        <div class="point-card">
          <h2>Open Source</h2>

          <p>
            Capacitor is completely open source (MIT) and maintained
            by <a href="http://ionicframework.com/">Ionic</a> and its community.
          </p>
        </div>

      </section>

    </div>
    );
  }
}
