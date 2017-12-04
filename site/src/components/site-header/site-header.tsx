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
          <img class="logo" alt="Stencil" src="/assets/img/avocado-logo.png" />
        </stencil-route-link>
        <div class="pull-right">
          <stencil-route-link urlMatch="/docs" url="/docs/intro/">
            Docs
          </stencil-route-link>
          <a href="https://github.com/ionic-team/avocado">
            GitHub
          </a>
        </div>
      </div>
    );
  }
}
