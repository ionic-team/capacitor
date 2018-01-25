import { Component, Prop, Element, Watch, State } from '@stencil/core';

@Component({
  tag: 'app-marked',
  styleUrl: 'app-marked.scss'
})
export class AppMarked {
  @Element() el: Element;

  @Prop() doc: string;
  @Prop({ context: 'isServer' }) private isServer: boolean;

  @State() content: string;

  componentWillLoad() {
    return this.fetchNewContent();
  }

  @Watch('doc')
  fetchNewContent() {
    return fetch(`/docs-content/${this.doc}`)
      .then(response => response.text())
      .then(data => {
        this.content = data;

        const el = document.createElement('div');
        el.innerHTML = data;

        const headerEl = el.querySelector('h1');
        document.title = (headerEl && headerEl.textContent + ' - Capacitor') || 'Capacitor';
        
        // requestAnimationFrame is not available for preRendering
        // or SSR, so only run this in the browser
        if (!this.isServer) {
          window.requestAnimationFrame(() => {
            window.scrollTo(0, 0);
          })
        }

      });
  }

  bindHeadings(el: Element) {
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

  componentDidUpdate() {

    this.bindHeadings(this.el);
  }

  render() {
    return (
      <div innerHTML={this.content}></div>
    )
  }
}
