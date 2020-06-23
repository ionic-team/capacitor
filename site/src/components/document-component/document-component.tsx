import { Component, Prop, Watch, State, h } from '@stencil/core';
import siteStructure from '../../assets/docs-structure.json';
import { findItem } from '../../global/site-structure-utils';
import { SiteStructureItem } from '../../global/definitions';

@Component({
  tag: 'document-component',
  styleUrl: 'document-component.scss'
})
export class DocumentComponent{
  @Prop() pages: string[] = [];

  @Prop() page: string = null;

  @State() item: SiteStructureItem;
  @State() nextItem: SiteStructureItem;
  @State() prevItem: SiteStructureItem;
  @State() parent: SiteStructureItem;

  componentWillLoad() {
    return this.fetchNewContent(this.page);
  }

  @Watch('page')
  fetchNewContent(page: string, oldPage?: string) {
    if (page == null || page === oldPage) {
      return;
    }
    const foundData = findItem(siteStructure as SiteStructureItem[], this.page);
    this.item = foundData.item;
    this.nextItem = foundData.nextItem;
    this.prevItem = foundData.prevItem;
    this.parent = foundData.parent;
  }

  render() {
    // debugger;
    if (this.item == null) {
      return <h1>Page not found</h1>;
    }
    return (
      <div class="container">
        <app-burger />
        <site-menu selectedParent={this.parent} siteStructureList={siteStructure as SiteStructureItem[]} />
        <app-marked fetchPath={this.item.filePath} renderer={(docsContent) => [
          <stencil-route-title
            pageTitle={docsContent.title ? `${docsContent.title} - Capacitor` : 'Capacitor'}></stencil-route-title>,
          <div class="doc-content">
            <div class="measure-lg">
              <div innerHTML={docsContent.content}></div>
              <h2>Contributors</h2>
              <contributor-list contributors={docsContent.contributors}></contributor-list>
              <lower-content-nav next={this.nextItem} prev={this.prevItem}></lower-content-nav>
            </div>
          </div>,
          <in-page-navigation
            pageLinks={docsContent.headings}
            srcUrl={docsContent.srcPath}
            currentPageUrl={docsContent.url}
          ></in-page-navigation>
        ]}/>
      </div>
    );
  }
}
