import type { WebViewPlugin } from './core-plugins';
import type { CapacitorInstance, GlobalInstance } from './definitions';

export const initVendor = (
  gbl: GlobalInstance,
  instance: CapacitorInstance,
): void => {
  const Ionic = (gbl.Ionic = gbl.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const Plugins = (instance.Plugins as any) as { WebView: WebViewPlugin };

  IonicWebView.getServerBasePath = (callback: (path: string) => void) => {
    Plugins?.WebView?.getServerBasePath().then(result => {
      callback(result.path);
    });
  };

  IonicWebView.setServerBasePath = (path: string) => {
    Plugins?.WebView?.setServerBasePath({ path });
  };

  IonicWebView.persistServerBasePath = () => {
    Plugins?.WebView?.persistServerBasePath();
  };

  IonicWebView.convertFileSrc = (url: string) => instance.convertFileSrc(url);
};
