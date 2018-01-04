package com.avocadojs;

import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class BridgeWebChromeClient extends WebChromeClient {

  @Override
  public boolean onJsAlert(WebView view, String url, String message, final JsResult result) {
    Dialogs.alert(view.getContext(), message, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        if(value) {
          result.confirm();
        } else {
          result.cancel();
        }
      }
    });

    return true;
  }
}
