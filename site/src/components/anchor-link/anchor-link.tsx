import { Component, Prop, PropDidChange, State } from '@stencil/core';

@Component({
  tag: 'anchor-link'
})
export class AppMarked {
  @Prop() to: string;

  handleClick(e: MouseEvent) {
    document.location.hash = this.to;
  }

  render() {
    return (
      <div onClick={this.handleClick.bind(this)}>
        <slot></slot>
      </div>
    )
  }
}
