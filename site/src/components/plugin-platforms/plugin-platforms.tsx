import { Component, Prop, h } from '@stencil/core';
@Component({
  tag: 'plugin-platforms',
  styleUrl: 'plugin-platforms.scss'
})
export class PluginPlatforms {
  @Prop() platforms: string = "";

  componentDidLoad() {
  }

  render() {
    const platforms = this.platforms.split(',');
    return (
    <div class="platforms">
      {platforms.map(platform => {
        return (
          <div class={`platform platform-icon-${platform}`}>{platform}</div>
        )
      })}
    </div>
    );
  }
}
