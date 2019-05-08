import { Component, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'site-menu',
  styleUrl: 'site-menu.scss'
})
export class SiteMenu {

  @Event() leftSidebarClick: EventEmitter;
  toggleMenu() {
    this.leftSidebarClick.emit();
  }

  MENU = [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Introduction',
          url: '/docs/'
        },
        {
          title: 'Required Dependencies',
          url: '/docs/getting-started/dependencies'
        },
        {
          title: 'Installation',
          url: '/docs/getting-started/'
        },
        {
          title: 'PWA Elements',
          url: '/docs/getting-started/pwa-elements/'
        },
        {
          title: 'Using with Ionic',
          url: '/docs/getting-started/with-ionic'
        }
        /*
        ,
        {
          title: 'Migrating from PhoneGap/Cordova',
          url: '/docs/getting-started/migrating-from-phonegap-cordova'
        }
        */
      ]
    },
    {
      title: 'Basics',
      items: [
        {
          title: 'Development Workflow',
          url: '/docs/basics/workflow'
        },
        {
          title: 'Opening Native IDE',
          url: '/docs/basics/opening-native-projects'
        },
        {
          title: 'Building your App',
          url: '/docs/basics/building-your-app'
        },
        {
          title: 'Running your App',
          url: '/docs/basics/running-your-app'
        },
        {
          title: 'Using Plugins',
          url: '/docs/basics/using-plugins'
        },
        {
          title: 'Cordova Plugins',
          url: '/docs/basics/cordova'
        },
        {
          title: 'Native Project Configuration',
          url: '/docs/basics/configuring-your-app'
        },
        {
          title: 'Progressive Web Apps',
          url: '/docs/basics/progressive-web-app'
        },
      ]
    },
    {
      title: "Guides",
      items: [
        {
          title: 'Ionic Framework App',
          url: '/docs/guides/ionic-framework-app'
        },
        {
          title: 'Firebase Push Notifications',
          url: '/docs/guides/firebase-push-notifications'
        }
      ]
    },
    {
      title: 'iOS',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/ios/'
        },
        {
          title: 'Configuration',
          url: '/docs/ios/configuration'
        },
        {
          title: 'Updating',
          url: '/docs/ios/updating'
        },
        {
          title: 'Custom Native Code',
          url: '/docs/ios/custom-code'
        },
        {
          title: 'Troubleshooting',
          url: '/docs/ios/troubleshooting'
        },
      ]
    },
    {
      title: 'Android',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/android/'
        },
        {
          title: 'Configuration',
          url: '/docs/android/configuration'
        },
        {
          title: 'Updating',
          url: '/docs/android/updating'
        },
        {
          title: 'Custom Native Code',
          url: '/docs/android/custom-code'
        },
        {
          title: 'Troubleshooting',
          url: '/docs/android/troubleshooting'
        },
      ]
    },
    {
      title: 'Web',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/web/'
        },
      ]
    },
    {
      title: 'Electron',
      items: [
        {
          title: 'Getting Started',
          url: '/docs/electron/'
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
          title: 'Community Plugins',
          url: '/docs/community/plugins/'
        },
        {
          title: 'iOS Guide',
          url: '/docs/plugins/ios'
        },
        {
          title: 'Android Guide',
          url: '/docs/plugins/android'
        },
        {
          title: 'Web/PWA Guide',
          url: '/docs/plugins/web'
        },
        {
          title: 'JavaScript Guide',
          url: '/docs/plugins/js'
        }
        /*
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
        */
      ]
    },
    {
      title: 'APIs',
      items: [
        {
          title: 'Introduction',
          url: '/docs/apis/'
        },
        { title: 'Accessibility', url: '/docs/apis/accessibility' },
        { title: 'App', url: '/docs/apis/app' },
        { title: 'Background Task', url: '/docs/apis/background-task' },
        { title: 'Browser', url: '/docs/apis/browser' },
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
        // { title: 'Photos', url: '/docs/apis/photos' },
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
        <ul id="menu-list">
          {this.MENU.map(s => {
            return (
            <li>
              <h4>{s.title}</h4>

              <ul>
                {s.items.map(i => {
                  return (
                  <li>
                    <stencil-route-link url={i.url} exact={true} onClick={() => this.toggleMenu()}>
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
