import type { WebViewPlugin } from './core-plugins';
import type {
  CapacitorInstance,
  WindowCapacitor,
} from './definitions-internal';

export const initVendor = (
  win: WindowCapacitor,
  cap: CapacitorInstance,
): void => {
  const Ionic = (win.Ionic = win.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const Plugins = (cap.Plugins as any) as { WebView: WebViewPlugin };

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

  IonicWebView.convertFileSrc = (url: string) => cap.convertFileSrc(url);
};
