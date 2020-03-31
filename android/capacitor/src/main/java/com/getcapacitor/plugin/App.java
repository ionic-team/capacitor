package com.getcapacitor.plugin;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginResult;

@NativePlugin()
public class App extends Plugin {

  private static final String EVENT_BACK_BUTTON = "backButton";
  private static final String EVENT_URL_OPEN = "appUrlOpen";
  private static final String EVENT_STATE_CHANGE = "appStateChange";
  private static final String EVENT_RESTORED_RESULT = "appRestoredResult";
  private boolean isActive = false;

  public void fireChange(boolean isActive) {
    Log.d(getLogTag(), "Firing change: " + isActive);
    JSObject data = new JSObject();
    data.put("isActive", isActive);
    this.isActive = isActive;
    notifyListeners(EVENT_STATE_CHANGE, data, false);
  }

  public void fireRestoredResult(PluginResult result) {
    Log.d(getLogTag(), "Firing restored result");
    notifyListeners(EVENT_RESTORED_RESULT, result.getWrappedResult(), true);
  }

  public void fireBackButton() {
    notifyListeners(EVENT_BACK_BUTTON, new JSObject(), true);

    // For Cordova compat, emit the backbutton event
    bridge.triggerJSEvent("backbutton", "document");
  }

  public boolean hasBackButtonListeners() {
    return hasListeners(EVENT_BACK_BUTTON);
  }

  @PluginMethod()
  public void exitApp(PluginCall call) {
    getBridge().getActivity().finish();
  }

  @PluginMethod()
  public void getLaunchUrl(PluginCall call) {
    Uri launchUri = bridge.getIntentUri();
    if (launchUri != null) {
      JSObject d = new JSObject();
      d.put("url", launchUri.toString());
      call.success(d);
    } else {
      call.success();
    }
  }

  @PluginMethod()
  public void getState(PluginCall call) {
    JSObject data = new JSObject();
    data.put("isActive", this.isActive);
    call.success(data);
  }

  @PluginMethod()
  public void canOpenUrl(PluginCall call) {
    String url = call.getString("url");
    if (url == null) {
      call.error("Must supply a url");
      return;
    }

    Context ctx = this.getActivity().getApplicationContext();
    final PackageManager pm = ctx.getPackageManager();

    JSObject ret = new JSObject();
    try {
      pm.getPackageInfo(url, PackageManager.GET_ACTIVITIES);
      ret.put("value", true);
      call.success(ret);
      return;
    } catch(PackageManager.NameNotFoundException e) {
      Log.e(getLogTag(), "Package name '"+url+"' not found!");
    }

    ret.put("value", false);
    call.success(ret);
  }

  @PluginMethod()
  public void openUrl(PluginCall call) {
    String url = call.getString("url");
    if (url == null) {
      call.error("Must provide a url to open");
      return;
    }

    JSObject ret = new JSObject();
    final PackageManager manager = getContext().getPackageManager();
    Intent launchIntent = new Intent(Intent.ACTION_VIEW);
    launchIntent.setData(Uri.parse(url));

    try {
      getActivity().startActivity(launchIntent);
      ret.put("completed", true);
    } catch(Exception ex) {
      launchIntent = manager.getLaunchIntentForPackage(url);
      try {
        getActivity().startActivity(launchIntent);
        ret.put("completed", true);
      } catch(Exception expgk) {
        ret.put("completed", false);
      }
    }
    call.success(ret);
  }

  /**
   * Handle ACTION_VIEW intents to store a URL that was used to open the app
   * @param intent
   */
  @Override
  protected void handleOnNewIntent(Intent intent) {
    super.handleOnNewIntent(intent);

    final String intentString = intent.getDataString();

    // read intent
    String action = intent.getAction();
    Uri url = intent.getData();

    if (!Intent.ACTION_VIEW.equals(action) || url == null) {
      return;
    }

    JSObject ret = new JSObject();
    ret.put("url", url.toString());
    notifyListeners(EVENT_URL_OPEN, ret, true);
  }

}
