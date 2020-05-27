import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'avc-code-type',
  styles: `
  :host {
    color: #5EB6FC;
    display: inline-block;
    color: $link-color;
    font-weight: 500;
  }
  `,
  shadow: true
})
export class AvcCodeType {

  @Prop() typeId: string;

  render() {
    if(this.typeId) {
      return (<anchor-link to={`type-${this.typeId}`}><slot></slot></anchor-link>);
    }
    return (
      <slot></slot>
    )
  }
}
