import { Component } from '@stencil/core';

@Component({
  tag: 'site-menu',
  styleUrl: 'site-menu.scss'
})
export class SiteMenu {
  MENU = [
    {
      title: 'Getting Started',
      items: [
        { 
          title: 'Introduction',
          url: '/docs/'
        },
        { 
          title: 'Installation',
          url: '/docs/getting-started/'
        },
        {
          title: 'Using with Ionic',
          url: '/docs/getting-started/with-ionic'
        },
        { 
          title: 'Required Dependencies',
          url: '/docs/getting-started/dependencies'
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
          title: 'Using Cordova Plugins',
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
      title: 'Plugins',
      items: [
        {
          title: 'Introduction',
          url: '/docs/plugins/'
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
        { title: 'Accessibility', url: '/docs/apis/accessibility' },
        { title: 'App', url: '/docs/apis/app' },
        { title: 'Background Task', url: '/docs/apis/background-task' },
        { title: 'Camera', url: '/docs/apis/camera' },
        { title: 'Clipboard', url: '/docs/apis/clipboard' },
        { title: 'Console', url: '/docs/apis/console' },
        { title: 'Device', url: '/docs/apis/device' },
        { title: 'Filesystem', url: '/docs/apis/filesystem' },
        { title: 'Geolocation', url: '/docs/apis/geolocation' },
        { title: 'Haptics', url: '/docs/apis/haptics' },
        { title: 'Keyboard', url: '/docs/apis/keyboard' },
        { title: 'Modals', url: '/docs/apis/modals' },
        { title: 'Motion', url: '/docs/apis/motion' },
        { title: 'Network', url: '/docs/apis/network' },
        // { title: 'Photos', url: '/docs/apis/photos' },
        //{ title: 'Push Notifications', url: '/docs/apis/push-notifications' },
        { title: 'Share', url: '/docs/apis/share' },
        { title: 'Splash Screen', url: '/docs/apis/splash-screen' },
        { title: 'Status Bar', url: '/docs/apis/status-bar' },
        { title: 'Storage', url: '/docs/apis/storage' },
        //{ title: 'Toast', url: '/docs/apis/toast' },
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
                    <stencil-route-link url={i.url} exact={true}>
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
