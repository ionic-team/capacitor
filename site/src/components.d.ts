/**
 * This is an autogenerated file created by the Stencil build process.
 * It contains typing information for all components that exist in this project
 * and imports for stencil collections that might be configured in your stencil.config.js file
 */

import '@stencil/router';


import {
  SiteMenu as SiteMenu
} from './components/site-menu/site-menu';

declare global {
  interface HTMLSiteMenuElement extends SiteMenu, HTMLElement {
  }
  var HTMLSiteMenuElement: {
    prototype: HTMLSiteMenuElement;
    new (): HTMLSiteMenuElement;
  };
  interface HTMLElementTagNameMap {
    "site-menu": HTMLSiteMenuElement;
  }
  interface ElementTagNameMap {
    "site-menu": HTMLSiteMenuElement;
  }
  namespace JSX {
    interface IntrinsicElements {
      "site-menu": JSXElements.SiteMenuAttributes;
    }
  }
  namespace JSXElements {
    export interface SiteMenuAttributes extends HTMLAttributes {
      
    }
  }
}

