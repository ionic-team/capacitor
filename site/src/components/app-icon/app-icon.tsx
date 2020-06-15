import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'app-icon',
  styleUrl: 'app-icon.scss'
})
export class AppIcon {

  @Prop() name: string;

  render() {
    return (
      <svg class={`icon icon-${this.name}`}>
        <use xlinkHref={`#icon-${this.name}`}/>
      </svg>
    );
  }
}
