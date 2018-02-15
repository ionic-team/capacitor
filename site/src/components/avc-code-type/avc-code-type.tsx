import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'avc-code-type'
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
