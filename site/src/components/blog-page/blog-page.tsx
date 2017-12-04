import { Component } from '@stencil/core';

@Component({
  tag: 'blog-page',
  styleUrl: 'blog-page.scss'
})
export class BlogPage {
  constructor() {
    document.title = `Avocado Blog - Build cross-platform apps with the web`;
  }

  render() {
    return (
      <div id="blog" class="wrapper">
        <div class="post">
          <h2>Announcing Avocado</h2>
          <div>By <a href="http://twitter.com/maxlynch">Max Lynch</a> on <time>December 12th, 2017</time></div>
        </div>
      </div>
    );
  }
}
