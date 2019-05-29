import { Component, Prop, ComponentInterface, State } from '@stencil/core';
import SiteProviderConsumer, { SiteState } from '../../global/site-provider-consumer';
import { SiteStructureItem } from '../../global/definitions';

@Component({
  tag: 'site-menu',
  styleUrl: 'site-menu.scss'
})
export class SiteMenu implements ComponentInterface{
  @Prop() siteStructureList: SiteStructureItem[] = [];
  @Prop({ mutable: true }) selectedParent: SiteStructureItem = null;

  @State() closeList = [];

  toggleParent = (itemNumber) => {
    return (e: MouseEvent) => {
      e.preventDefault();
      if (this.closeList.indexOf(itemNumber) !== -1) {
        this.closeList.splice(this.closeList.indexOf(itemNumber), 1)
        this.closeList = [...this.closeList];
      } else {
        this.closeList = [...this.closeList, itemNumber];
      }

      console.log(e, this.closeList)
    }
  }

  render() {
    return (
      <div class="sticky">
        <SiteProviderConsumer.Consumer>
        {({ toggleLeftSidebar }: SiteState) => (
          <div>
            <ul class='menu-list'>
              { this.siteStructureList.map((item, i) => (
                <li>
                  <a href="#" onClick={this.toggleParent(i)}>
                    <span class="section-label">
                      {item.text}
                    </span>
                  </a>
                  <ul class={{ 'collapsed': this.closeList.indexOf(i) !== -1 }}>
                  { item.children.map((childItem) => (
                    <li>
                      { (childItem.url) ?
                      <stencil-route-link url={childItem.url} exact={true} onClick={toggleLeftSidebar}>
                        {childItem.text}
                      </stencil-route-link> :
                      <a rel="noopener" class="link--external" target="_blank" href={childItem.filePath}>
                        {childItem.text}
                      </a> }
                    </li>
                  )) }
                  </ul>
                </li>
              )) }
            </ul>
          </div>
        )}
        </SiteProviderConsumer.Consumer>
      </div>
    );
  }
}
