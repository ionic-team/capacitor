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
          url: '/docs/'
        },
        { 
          title: 'Getting Started',
          url: '/docs/getting-started/'
        },
        { 
          title: 'Required Dependencies',
          url: '/docs/getting-started/dependencies'
        },
        {
          title: 'Migrating from PhoneGap/Cordova',
          url: '/docs/getting-started/migrating-from-phonegap-cordova'
        }
      ]
    },
    {
      title: 'Basics',
      items: [
        /*
        {
          title: 'Creating Apps',
          url: '/docs/basics/creating-apps'
        },
        {
          title: 'Project Structure',
          url: '/docs/basics/app-project-structure'
        },
        */
        {
          title: 'Opening Native Projects',
          url: '/docs/basics/opening-native-projects'
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
        { title: 'Accessibility', url: '/docs/apis/accessibility' },
        { title: 'App State', url: '/docs/apis/app-state' },
        { title: 'Camera', url: '/docs/apis/camera' },
        { title: 'Clipboard', url: '/docs/apis/clipboard' },
        { title: 'Console', url: '/docs/apis/console' },
        { title: 'Device', url: '/docs/apis/device' },
        { title: 'Filesystem', url: '/docs/apis/filesystem' },
        { title: 'Geolocation', url: '/docs/apis/geolocation' },
        { title: 'Haptics', url: '/docs/apis/haptics' },
        { title: 'Keyboard', url: '/docs/apis/keyboard' },
        { title: 'Local Notifications', url: '/docs/apis/local-notifications' },
        { title: 'Modals', url: '/docs/apis/modals' },
        { title: 'Motion', url: '/docs/apis/motion' },
        { title: 'Network', url: '/docs/apis/network' },
        { title: 'Photos', url: '/docs/apis/photos' },
        { title: 'Push Notifications', url: '/docs/apis/push-notifications' },
        { title: 'Share', url: '/docs/apis/share' },
        { title: 'Splash Screen', url: '/docs/apis/splash-screen' },
        { title: 'Status Bar', url: '/docs/apis/status-bar' },
        { title: 'Storage', url: '/docs/apis/storage' },
        { title: 'Toast', url: '/docs/apis/toast' },
      ]
    }
  ];

  render() {
    return (
      <div>
        <iframe class="star-button" src="https://ghbtns.com/github-btn.html?user=ionic-team&repo=capacitor&type=star&count=true" frameBorder="0" scrolling="0" width="170px" height="20px"></iframe>
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
