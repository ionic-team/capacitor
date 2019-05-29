import { Component, Prop, State, Watch, ComponentInterface } from '@stencil/core';
import { MarkdownContent } from '../../global/definitions';

@Component({
  tag: 'app-marked',
  styleUrl: 'app-marked.scss'
})
export class AppMarked implements ComponentInterface {

  @Prop() fetchPath?: string;
  @Prop() renderer?: (doc: MarkdownContent) => JSX.Element;

  @State() docsContent: MarkdownContent = {};

  componentWillLoad() {
    return this.fetchNewContent(this.fetchPath);
  }

  @Watch('fetchPath')
  fetchNewContent(docPath: string, oldDocPath?: string) {
    if (docPath == null || docPath === oldDocPath) {
      return;
    }
    return fetchContent(this.fetchPath).then(data => {
      if (data != null) {
        this.docsContent = data;
      }
    });
  }

  render() {
    return this.renderer ? this.renderer(this.docsContent) : null;
  }
}

const localCache = new Map<string, Promise<MarkdownContent>>();

function fetchContent(path: string) {
  let promise = localCache.get(path);
  if (!promise) {
    promise = fetch(path, {cache: 'force-cache'}).then(response => response.json());
    localCache.set(path, promise);
  }
  return promise;
}
