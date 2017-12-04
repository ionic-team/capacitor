import { Component } from '@stencil/core';

@Component({
  tag: 'site-menu',
  styleUrl: 'site-menu.scss'
})
export class SiteMenu {
  MENU = [
    {
      title: 'Essentials',
      items: [
        { 
          title: 'Introduction',
          url: '/docs/intro'
        },
        { 
          title: 'Getting Started',
          url: '/docs/intro/getting-started'
        },
        {
          title: 'Migrating from PhoneGap/Cordova',
          url: '/docs/intro/migrating-from-phonegap-cordova'
        }
      ]
    },
    {
      title: 'Basics',
      items: [
        {
          title: 'Creating Apps',
          url: '/docs/basics/creating-apps'
        },
        {
          title: 'Project Structure',
          url: '/docs/basics/app-project-structure'
        },
        {
          title: 'App Configuration',
          url: '/docs/basics/configuring-your-app'
        },
        {
          title: 'Building your App',
          url: '/docs/basics/building-your-app'
        },
        {
          title: 'Running your App',
          url: '/docs/basics/running-your-app'
        }
      ]
    },
    {
      title: 'iOS',
      items: [
        {
          title: 'Configuration',
          url: '/docs/ios/configuration'
        },
        {
          title: 'Managing Dependencies',
          url: '/docs/ios/managing-dependencies'
        }
      ]
    },
    {
      title: 'Android',
      items: [
        {
          title: 'Configuration',
          url: '/docs/android/configuration'
        },
        {
          title: 'Managing Dependencies',
          url: '/docs/android/managing-dependencies'
        }
      ]
    },
    {
      title: 'Plugins',
      items: [
        {
          title: 'Introduction',
          url: '/docs/plugins/'
        },
        {
          title: 'Installing Plugins',
          url: '/docs/plugins/installng-plugins/'
        },
        {
          title: 'Creating Plugins',
          url: '/docs/plugins/creating-plugins/'
        },
        {
          title: 'Plugin JavaScript API',
          url: '/docs/plugins/plugin-api-javascript'
        }
      ]
    },
    {
      title: 'APIs',
      items: [
        { title: 'Device', url: '/docs/apis/device' },
        { title: 'Console', url: '/docs/apis/console' },
        { title: 'Contacts', url: '/docs/apis/contacts' },
        { title: 'Camera', url: '/docs/apis/camera' },
        { title: 'Offline', url: '/docs/apis/offline' },
        { title: 'File', url: '/docs/apis/file' }
      ]
    }
  ];

  render() {
    return (
      <div>
        <iframe class="star-button" src="https://ghbtns.com/github-btn.html?user=ionic-team&repo=stencil&type=star&count=true" frameBorder="0" scrolling="0" width="170px" height="20px"></iframe>
        <ul id="menu-list">
          {this.MENU.map(s => {
            return (
            <li>
              <h4>{s.title}</h4>

              <ul>
                {s.items.map(i => {
                  return (
                  <li>
                    <stencil-route-link url={i.url}>
                      {i.title}
                    </stencil-route-link>
                  </li>
                  );
                })}
              </ul>
            </li>
            )
          })}
        </ul>
      </div>
    );
  }
}
