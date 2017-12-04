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
    document.title = `Avocado: Universal Web Applications`;
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
              <h1 id="action-call">A universal runtime<br/> for containerizing web applications.</h1>
              <div id="action-more">
                Build cross-platform apps with JS, HTML, and CSS
                <br />
                <br />
                <b>Sign up for updates and early access to the preview.</b>
              </div>
              <section id="buttons">
                <form id="cta-form">
                  <div class="input-with-button">
                    <input type="email" placeholder="Email address" />
                    <button>Notify me</button>
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
            <h2>Cross-platform</h2>

            <p>
              Build web apps that run equally well on iOS, Android,
              Electron, and as Progressive Web Apps
          </p>
        </div>

        <div class="point-card performant">
          <h2>Native</h2>

          <p>
            Access the full native capabilities of your device for powerful, best-of-breed apps
          </p>
        </div>

        <div class="point-card future-proof">
          <h2>Future proof</h2>

          <p>
            Built on web standards that stand the test of time. Focus on the web,
            deploy anywhere.
          </p>
        </div>
      </section>

    </div>
    );
  }
}
