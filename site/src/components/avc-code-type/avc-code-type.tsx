import { Component, Prop, PropDidChange, State } from '@stencil/core';

@Component({
  tag: 'avc-code-type'
})
export class AvcCodeType {

  @Prop() typeId: string;

  render() {
    if(this.typeId) {
      return (<a href="#"><slot></slot></a>);
    }
    return (
      <slot></slot>
    )
  }
}
