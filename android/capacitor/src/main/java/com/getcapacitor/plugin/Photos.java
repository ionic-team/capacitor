package com.getcapacitor.plugin;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class Photos extends Plugin {

  @PluginMethod()
  public void getAlbums(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void getPhotos(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void createAlbum(PluginCall call) {
    call.unimplemented();
  }

  @PluginMethod()
  public void savePhoto(PluginCall call) {
    call.unimplemented();
  }
}
