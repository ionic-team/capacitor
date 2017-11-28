import { Component, Prop } from '@stencil/core';
@Component({
  tag: 'document-component',
  styleUrl: 'document-component.scss'
})
export class DocumentComponent {
  @Prop() pages: string[] = [];

  render() {
    console.log(this.pages);
    return (
      <div class="wrapper">
        <div class="pull-left">
          <site-menu />
        </div>

        <div class="pull-right">
          {this.pages.map(page => <app-marked doc={page} />)}
        </div>
      </div>
    );
  }
}
