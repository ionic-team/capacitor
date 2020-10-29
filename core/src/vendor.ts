import type { Capacitor, GlobalInstance } from './definitions';

export const initVendor = (gbl: GlobalInstance, instance: Capacitor): void => {
  const Ionic = (gbl.Ionic = gbl.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const WebViewPlugin = instance.Plugins.WebView;

  IonicWebView.getServerBasePath = (callback: (path: string) => void) => {
    if (WebViewPlugin) {
      WebViewPlugin.getServerBasePath().then(result => {
        callback(result.path);
      });
    }
  };

  IonicWebView.setServerBasePath = (path: string) => {
    if (WebViewPlugin) {
      WebViewPlugin.setServerBasePath({ path });
    }
  };

  IonicWebView.persistServerBasePath = () => {
    if (WebViewPlugin) {
      WebViewPlugin.persistServerBasePath();
    }
  };

  IonicWebView.convertFileSrc = (url: string) => instance.convertFileSrc(url);
};
