import { Component, Element } from '@stencil/core';


@Component({
  tag: 'landing-page',
  styleUrl: 'landing-page.scss'
})
export class LandingPage {

  @Element() el: Element;

  constructor() {
    document.title = `Avocado: Universal Web Applications`;
  }

  render() {
    return (
      <div>

        <main>
          <h1 id="action-call">Universal Runtime<br/> for Web Applications</h1>

          <section id="buttons">

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
          </section>
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
