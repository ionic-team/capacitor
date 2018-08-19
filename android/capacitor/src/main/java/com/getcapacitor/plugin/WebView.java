package com.getcapacitor.plugin;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class WebView extends Plugin {

  @PluginMethod()
  public void setServerBasePath(PluginCall call) {
    String path = call.getString("path");
    bridge.setServerBasePath(path);
    call.success();
  }

  @PluginMethod()
  public void getServerBasePath(PluginCall call) {
    String path = bridge.getServerBasePath();
    JSObject ret = new JSObject();
    ret.put("path", path);
    call.success(ret);
  }
}
