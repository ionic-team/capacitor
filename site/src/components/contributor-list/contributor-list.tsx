import { Component, Prop } from '@stencil/core';

@Component({
  tag: 'contributor-list',
  styleUrl: 'contributor-list.css'
})
export class ContributorList {
  @Prop() contributors: string[] = [];
  @Prop() link = (contributor: string) => `https://github.com/${contributor}`;

  render() {
    if (this.contributors.length === 0) {
      return null;
    }

    return (
      <ul class="img-list">
        {this.contributors.reverse().map(contributor => (
          <li>
            <a class="contributor-img" target="_blank" href={this.link(contributor)}>
              <img src={`https://github.com/${contributor}.png?size=90`} title={`Contributor ${contributor}`}/>
            </a>
          </li>
        ))}
      </ul>
    );
  }
}
