import { Component, h, Prop } from '@stencil/core';

/**
 * Used in the generated doc markup as well as the site, so don't remve this
 * even if it looks like no one is using it
 */
@Component({
  tag: 'anchor-link',
  styleUrl: 'anchor-link.scss'
})
export class AnchorLink {
  @Prop() to: string;

  handleClick(_e: MouseEvent) {
    if (document.location.hash !== '#' + this.to) {
      document.location.hash = this.to;
      let scrollTop = document.querySelector('html').scrollTop;
      // Update scroll top to clear the header bar
      window.scrollTo(0, scrollTop - 80);
    } else {
      document.location.hash = '';
      document.location.hash = this.to;
    }
  }

  render() {
    return (
      <div onClick={this.handleClick.bind(this)}>
        <slot></slot>
      </div>
    )
  }
}
