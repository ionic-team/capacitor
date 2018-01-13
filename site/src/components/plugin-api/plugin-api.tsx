import { Component, Prop, State } from '@stencil/core';
@Component({
  tag: 'plugin-api',
  styleUrl: 'plugin-api.scss'
})
export class PluginApi {
  @Prop() name: string;
  @Prop() index: boolean;
  @State() content: string;

  componentDidLoad() {
    const url = `api${this.index ? '-index' : ''}.html`;
    return fetch(`/capacitor/docs-content/apis/${this.name}/${url}`)
      .then(response => response.text())
      .then(data => {
        this.content = data;

        const el = document.createElement('div');
        el.innerHTML = data;
      });
  }

  render() {
    return (
    <div>
      <div innerHTML={this.content}></div>
    </div>
    );
  }
}
