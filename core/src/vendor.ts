import { CapacitorInstance, WindowCapacitor } from "./definitions-internal";

export const initVendor = (win: WindowCapacitor, cap: CapacitorInstance) => {
  const Ionic = (win.Ionic = win.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const Plugins = cap.Plugins;

  IonicWebView.getServerBasePath = callback => {
    if (Plugins && Plugins.WebView && Plugins.WebView.getServerBasePath) {
      Plugins.WebView.getServerBasePath().then(result => {
        callback(result.path);
      });
    }
  };

  IonicWebView.setServerBasePath = path => {
    if (Plugins && Plugins.WebView && Plugins.WebView.setServerBasePath) {
      Plugins.WebView.setServerBasePath({ path });
    }
  };

  IonicWebView.persistServerBasePath = () => {
    if (Plugins && Plugins.WebView && Plugins.WebView.persistServerBasePath) {
      Plugins.WebView.persistServerBasePath();
    }
  };

  IonicWebView.convertFileSrc = url => cap.convertFileSrc(url);
};
