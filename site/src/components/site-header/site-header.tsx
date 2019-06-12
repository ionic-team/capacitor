import { Component, Element, Listen, State } from '@stencil/core';

@Component({
  tag: 'site-header',
  styleUrl: 'site-header.scss'
})
export class SiteHeader {
  @Element() el: Element;

  @State() isMobileMenuShown: boolean;
  @State() isDropdownShown: boolean;
  @State() isScrolled = false;

  @Listen('window:resize')
  handleResize() {
    requestAnimationFrame(() => {
      if (window.innerWidth > 768) {
        const menu = (this.el.querySelector('.header-menu') as HTMLElement);
        menu.style.display = "";
        this.el.classList.remove('show-mobile-menu');
        document.body.classList.remove('no-scroll');
        this.isMobileMenuShown = false;
      }
    });
  }

  @Listen('window:scroll')
  handleScroll(event) {
    requestAnimationFrame(() => {
      if (event.target.documentElement.scrollTop !== 0 && !this.isScrolled) {
        this.el.classList.add('scrolled');
        this.isScrolled = true;
      } else if (event.target.documentElement.scrollTop === 0 && this.isScrolled) {
        this.el.classList.remove('scrolled');
        this.isScrolled = false;
      }
    });
  }

  componentDidLoad() {
    this.isMobileMenuShown = false;
  }

  showNav () {
    if (this.isMobileMenuShown) return;
    this.isMobileMenuShown = true;

    const menu = (this.el.querySelector('.header-menu') as HTMLElement);

    menu.style.display = "flex";
    setTimeout(() => {
      this.el.classList.add('show-mobile-menu');
      document.body.classList.add('no-scroll');
    }, 1)
  }

  hideNav () {
    if (!this.isMobileMenuShown) return;
    this.isMobileMenuShown = false;

    const menu = (this.el.querySelector('.header-menu') as HTMLElement);

    this.el.classList.remove('show-mobile-menu');
    setTimeout(() => {
      menu.style.display = "none";
      document.body.classList.remove('no-scroll');
    }, 300)
  }

  handleDropdownEnter () {
    this.isDropdownShown = true;
  }

  handleDropdownLeave () {
    this.isDropdownShown = false;
  }

  render() {
    return (
      <div class="site-header container">

        <stencil-route-link url="/" class="logo-link">
          <div class="logo"></div>
        </stencil-route-link>

        <div class="header-menu">
          <stencil-route-link urlMatch="/docs" url="/docs/" onClick={() => { this.hideNav() }}>
            Docs
          </stencil-route-link>
          {/* <stencil-route-link urlMatch="/blog" url="/blog/" onClick={() => { this.hideNav() }}>
            Blog
          </stencil-route-link> */}

          <span
            class={{
              'link': true,
              'dropdown': true,
              'dropdown--visible': this.isDropdownShown
            }}
            onMouseEnter={this.handleDropdownEnter.bind(this)}
            onMouseLeave={this.handleDropdownLeave.bind(this)}>
            <span class="dropdown__label">Community</span>
            <ul class="dropdown__menu">
              <div class="dropdown__arrow"></div>
              <li class="dropdown__item">
                <a href="/docs/community/plugins/">Plugins</a>
              </li>
              <li class="dropdown__item">
                <a href="https://forum.ionicframework.com/">Forum</a>
              </li>
              <li class="dropdown__item">
                <a href="https://getcapacitor.herokuapp.com/">Slack</a>
              </li>
              <li class="dropdown__item">
                <a href="https://twitter.com/getcapacitor">Twitter</a>
              </li>
            </ul>
          </span>

          <a class="link link--external" href="https://github.com/ionic-team/capacitor">
            GitHub
            <app-icon name="targetblank"></app-icon>
          </a>

          <div class="header-close" onClick={() => { this.hideNav() }}>
            <app-icon name="close"></app-icon>
          </div>
        </div>

        <div class="header-overflow" onClick={() => { this.showNav() }}>
          <app-icon name="more"></app-icon>
        </div>
      </div>
    );
  }
}
