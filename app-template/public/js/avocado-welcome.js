window.customElements.define('avocado-welcome', class extends HTMLElement {
  constructor() {
    super();
    
    const root =this.attachShadow({ mode: 'closed' });

    root.innerHTML = `
    <style>
      :host {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        display: block;
        width: 100%;
        height: 100%;
      }
      h1, h2, h3, h4, h5 {
        text-transform: uppercase;
      }
      .button {
        display: inline-block;
        padding: 10px;
        background-color: #5ec166;
        color: #fff;
        font-size: 0.9em;
        border: 0;
        border-radius: 3px;
        text-decoration: none;
      }
      main {
        padding: 15px;
      }
      main h1 {
        font-size: 1.4em;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      main h2 {
        font-size: 1.1em;
      }
      main h3 {
        font-size: 0.9em;
      }
      main p {
        color: #333;
      }
      main pre {
        white-space: pre-line;
      }
    </style>
    <div>
      <avocado-welcome-titlebar>
        <h1>Avocado</h1>
      </avocado-welcome-titlebar>
      <main>
        <!--<h1>Welcome to Avocado</h1>-->
        <p>
          Avocado makes it easy to build powerful apps for the app stores, mobile web (Progressive Web Apps), and desktop, all
          with a single code base.
        </p>
        <h2>Getting Started</h2>
        <p>
          Avocado doesn't come with any UI controls out of the box. Instead, you should use a project like Ionic
          which will give you a rich set of mobile and web-enabled UI controls and additional tools for building
          and deploying apps.
        </p>
        <h3>1. With Ionic</h3>
        <code><pre>
          npm install -g ionic
          ionic avocado init
        </pre></code>
        <a href="https://ionicframework.com/" target="_blank" class="button">Read more</a>
        <h3>2. No UI or with another UI library</h3>
        Continue to use the avocado CLI directly and/or follow your library's instructions.
        <h2>Documentation and Resources</h2>
        <p>
          Visit <a href="http://ionic-team.github.io/avocado">ionic-team.github.io/avocado</a> for information
          on using native features, building plugins, and more.
        </p>
        <a href="http://ionic-team.github.io/avocado" target="_blank" class="button">Read more</a>
      </main>
    </div>
    `
  }
});

window.customElements.define('avocado-welcome-titlebar', class extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'closed' });
    root.innerHTML = `
    <style>
      :host {
        position: relative;
        display: block;
        padding: 15px 15px 15px 15px;
        text-align: center;
        background-color: #5ec166;
      }
      ::slotted(h1) {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 0.9em;
        font-weight: 600;
        color: #fff;
      }
    </style>
    <slot></slot>
    `;
  }
})