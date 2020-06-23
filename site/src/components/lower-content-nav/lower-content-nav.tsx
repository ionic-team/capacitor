import { Component, Prop, h } from '@stencil/core';
import { SiteStructureItem } from '../../global/definitions';

@Component({
  tag: 'lower-content-nav',
  styleUrl: 'lower-content-nav.css'
})
export class LowerContentNav {

  @Prop() next?: SiteStructureItem;
  @Prop() prev?: SiteStructureItem; 

  render() {
    return [
      (this.prev != null ?
        <stencil-route-link url={this.prev.url} anchorClass="pull-left btn btn--secondary">
          Back
        </stencil-route-link> :
        null ),
      (this.next != null ?
        <stencil-route-link url={this.next.url} anchorClass="pull-right btn btn--primary">
          Next
        </stencil-route-link> :
        null )
    ];
  }
}