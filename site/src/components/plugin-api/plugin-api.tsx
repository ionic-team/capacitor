import { Component, Prop, State } from '@stencil/core';
@Component({
  tag: 'plugin-api',
  styleUrl: 'plugin-api.scss'
})
export class PluginApi {
  @Prop() name: string;
  @State() content: string;

  componentDidLoad() {
    return fetch(`/avocado/docs-content/apis/${this.name}/api.html`)
      .then(response => response.text())
      .then(data => {
        this.content = data;

        const el = document.createElement('div');
        el.innerHTML = data;
      });
  }

  render() {
    return (<div innerHTML={this.content}></div>);
  }
}
