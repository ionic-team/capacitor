import { Component, Prop, PropDidChange, State } from '@stencil/core';

@Component({
  tag: 'anchor-link'
})
export class AppMarked {
  @Prop() to: string;

  handleClick(e: MouseEvent) {
    document.location.hash = this.to;
    let scrollTop = document.querySelector('html').scrollTop;
    // Update scroll top to clear the header bar
    window.scrollTo(0, scrollTop - 60);
  }

  render() {
    return (
      <div onClick={this.handleClick.bind(this)}>
        <slot></slot>
      </div>
    )
  }
}
