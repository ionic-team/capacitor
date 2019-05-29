import { Component, Prop, ComponentInterface, Listen, State, Watch } from '@stencil/core';
import { MarkdownHeading } from '../../global/definitions';

interface ItemOffset {
  id: string,
  topOffset: number
}

@Component({
  tag: 'in-page-navigation',
  styleUrl: 'in-page-navigation.css'
})
export class InPageNavigtion implements ComponentInterface {

  @Listen('window:scroll')
  function() {
    const itemIndex = this.itemOffsets.findIndex(item => item.topOffset > window.scrollY);
    if (itemIndex === 0 || this.itemOffsets[this.itemOffsets.length - 1] === undefined) {
      this.selectedId = null;
    } else if (itemIndex === -1) {
      this.selectedId = this.itemOffsets[this.itemOffsets.length - 1].id
    } else {
      this.selectedId = this.itemOffsets[itemIndex - 1].id
    }
  }

  @Prop() pageLinks: MarkdownHeading[] = [];
  @Prop() srcUrl: string = '';
  @Prop() currentPageUrl: string = '';
  @State() itemOffsets: ItemOffset[] = [];
  @State() selectedId: string = null;

  @Watch('pageLinks')
  @Listen('window:resize')
  updateItemOffsets() {
    requestAnimationFrame(() => {
      this.itemOffsets = this.pageLinks.map((pl) => {
        const item = document.getElementById(pl.id);
        return {
          id: pl.id,
          topOffset: item.getBoundingClientRect().top + window.scrollY
        };
      });
    });
  }

  componentDidLoad() {
    this.updateItemOffsets();
  }

  ghIcon() {
    return (
      <svg id="icon-github" viewBox="0 0 512 512" width="100%" height="100%">
        <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9 1.4.3 2.6.4 3.8.4 8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1-8.4 1.9-15.9 2.7-22.6 2.7-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1 10.5 0 20-3.4 25.6-6 2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8 0 0 1.6-.5 5-.5 8.1 0 26.4 3.1 56.6 24.1 17.9-5.1 37-7.6 56.1-7.7 19 .1 38.2 2.6 56.1 7.7 30.2-21 48.5-24.1 56.6-24.1 3.4 0 5 .5 5 .5 12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5 1.2 0 2.6-.1 4-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z">
        </path>
      </svg>
    )
  }

  stripTags(html){
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  
  render() {
    const pageLinks = this.pageLinks.filter(pl => pl.level !== 1);
    const submitEditLink = (
       <a class="submit-edit-link" href={`https://github.com/ionic-team/capacitor/tree/master/site/${this.srcUrl}`}>
         {this.ghIcon()}
         <span>Submit an edit</span>
       </a>
    );

    if (pageLinks.length === 0) {
      return (
        <div class="sticky">
          { submitEditLink }
        </div>
      );
    }

    return (
      <div class="sticky">
        <h5>Contents</h5>
        <ul class="heading-links">
          { pageLinks.map(pl => (
          <li class={{
              'heading-link': true,
              [`size-h${pl.level}`]: true,
              'selected': this.selectedId === pl.id
            }}>
            <stencil-route-link url={`${this.currentPageUrl}#${pl.id}`}>{this.stripTags(pl.text)}</stencil-route-link>
          </li>
          )) }
        </ul>
        { submitEditLink }
      </div>
    );
  }
}
