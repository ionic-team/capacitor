import { Component, h } from '@stencil/core';

@Component({
  tag: 'demos-page',
  styleUrl: 'demos-page.scss'
})
export class DemosPage {

  demos = [
    {
      title: 'Stenciljs.com',
      description: 'Yep, this site is also built with Stencil!',
      url: 'https://stenciljs.com/',
      source: 'https://github.com/ionic-team/stencil-site',
    },
    {
      title: 'IonicHN',
      description: 'Hacker News PWA built with @stencil/core and @ionic/core',
      url: 'https://corehacker-10883.firebaseapp.com/',
      source: 'https://github.com/ionic-team/ionic-stencil-hn-app'
    },
    {
      title: 'Stencil Fiber demo',
      description: 'This showcases the runtime performance of stencil using our async rendering',
      url: 'https://stencil-fiber-demo.firebaseapp.com/',
      source: 'https://github.com/ionic-team/stencil-fiber-demo'
    },
    {
      title: 'StencilNews',
      description: 'Demo of how you could use @stencil/core to build a fast, modern News PWA',
      url: 'https://stencilnews.firebaseapp.com/',
      source: 'https://github.com/ionic-team/stencil-news'
    }
  ];

  constructor() {
    document.title = `Stencil Demos`;
  }

  render() {
    return (
      <div class="wrapper">
        <div class="pull-left">
          <site-menu />
        </div>

        <div class="pull-right">
          <h1>Demos</h1>
          <h4>Awesome demos of apps built using Stencil and Ionic</h4>
          {this.demos.map(demo => {
            return [
              <h4>{demo.title}</h4>,
              <p>{demo.description}</p>,
              <p>
                <a target="_blank" rel="noopener" href={demo.url}>Demo</a>
                &nbsp;&nbsp;
              <a target="_blank" rel="noopener" href={demo.source}>Source</a>
              </p>
            ];
          })}

        </div>
      </div>
    );
  }
}
