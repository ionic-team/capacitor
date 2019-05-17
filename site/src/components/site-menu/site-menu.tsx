import { Component, Prop, ComponentInterface } from '@stencil/core';
import SiteProviderConsumer, { SiteState } from '../../global/site-provider-consumer';
import { SiteStructureItem } from '../../global/definitions';

@Component({
  tag: 'site-menu',
  styleUrl: 'site-menu.scss'
})
export class SiteMenu implements ComponentInterface{
  @Prop() siteStructureList: SiteStructureItem[] = [];
  @Prop({ mutable: true }) selectedParent: SiteStructureItem = null;

  toggleParent = (parentItem: SiteStructureItem) => {
    return (e: MouseEvent) => {
      e.preventDefault();
      this.selectedParent = parentItem;
    }
  }

  render() {
    return (
      <div class="sticky">
        <SiteProviderConsumer.Consumer>
        {({ toggleLeftSidebar }: SiteState) => (
          <div>
            <ul class='menu-list'>
              { this.siteStructureList.map((item) => (
                <li>
                  <a href="#" onClick={this.toggleParent(item)}>
                    <span class="section-label">
                      {item.text}
                    </span>
                  </a>
                  <ul class={{ 'collapsed': item !== this.selectedParent }}>
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
