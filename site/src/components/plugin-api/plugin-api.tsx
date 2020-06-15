import { Component, Prop, State, Element, h } from '@stencil/core';
@Component({
  tag: 'plugin-api',
  styleUrl: 'plugin-api.scss'
})
export class PluginApi {
  @Element() el: Element;
  @Prop({ context: 'isServer' }) private isServer: boolean;
  @Prop() name: string;
  @Prop() index: boolean;
  @State() content: string;

  componentWillLoad() {
    if (this.isServer) {
      return;
    }
    const url = `api${this.index ? '-index' : ''}.html`;
    return fetch(`/assets/docs-content/apis/${this.name}/${url}`)
      .then(response => {
        return response.text()
      })
      .then(data => {
        this.content = data;

        const el = document.createElement('div');
        el.innerHTML = data;
      });
  }

  componentDidUpdate() {
    this.bindHeadings(this.el); 
  }

  bindHeadings(el: Element) {
    if (this.isServer) {
      return;
    }

    const headings = Array.from(el.querySelectorAll('h1,h2,h3,h4,h5'));
    headings.forEach(h => {
      h.classList.add('anchor-link-relative');
      var link = document.createElement('anchor-link');
      link.className = 'hover-anchor';
      if (h.id) {
        link.to = h.id;
      }
      link.innerHTML = '#';
      h.insertBefore(link, h.firstChild);
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
