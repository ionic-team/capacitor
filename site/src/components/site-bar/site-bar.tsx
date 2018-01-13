import { Component } from '@stencil/core';

@Component({
  tag: 'site-bar',
  styleUrl: 'site-bar.scss'
})
export class SiteBar {
  render() {
    return (
      <div class="site-bar">
        Capacitor is in Private Preview. Read the <stencil-route-link url="/blog">announcement blog</stencil-route-link> for more info on the project
      </div>
    );
  }
}
