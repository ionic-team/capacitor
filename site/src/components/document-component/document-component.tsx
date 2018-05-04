import { Component, Prop } from '@stencil/core';
@Component({
  tag: 'document-component',
  styleUrl: 'document-component.scss'
})
export class DocumentComponent {
  @Prop() pages: string[] = [];

  componentWillLoad() {
    // document.body.style.backgroundColor = 'white';
  }

  render() {
    return (
      <div class="wrapper">
        <div class="container">
            <site-menu />
            {this.pages.map(page => <app-marked doc={page} />)}
        </div>
      </div>
    );
  }
}
