import { Component } from '@stencil/core';

@Component({
  tag: 'site-header',
  styleUrl: 'site-header.scss'
})
export class SiteHeader {
  render() {
    return (
      <div class="site-header">
        <stencil-route-link url="/" class="logo-link">
          <div class="logo"></div>
        </stencil-route-link>
        <div class="pull-right">
          <b>0.0.10 Preview</b>
          <stencil-route-link urlMatch="/docs" url="/docs/">
            Docs
          </stencil-route-link>
          <a href="https://github.com/ionic-team/capacitor">
            GitHub
          </a>
        </div>
      </div>
    );
  }
}
