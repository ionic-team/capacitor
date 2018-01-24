import { Component, Prop, PropDidChange, State } from '@stencil/core';

@Component({
  tag: 'app-marked',
  styleUrl: 'app-marked.scss'
})
export class AppMarked {

  @Prop() doc: string;
  @Prop({ context: 'isServer' }) private isServer: boolean;

  @State() content: string;

  componentWillLoad() {
    return this.fetchNewContent();
  }

  @PropDidChange('doc')
  fetchNewContent() {
    return fetch(`/capacitor/docs-content/${this.doc}`)
      .then(response => response.text())
      .then(data => {
        this.content = data;

        const el = document.createElement('div');
        el.innerHTML = data;

        this.bindHeadings(el);

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
      console.log('Heading', h);
      var link = document.createElement('a');
      if (h.id) {
        link.href = '#' + h.id;
      }
      link.innerHTML = 'LINK';
      h.insertBefore(link, h.firstChild);
    });
  }

  render() {
    return (
      <div innerHTML={this.content}></div>
    )
  }
}
