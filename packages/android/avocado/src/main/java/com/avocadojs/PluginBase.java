package com.avocadojs;

import android.content.Context;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;

/**
 * Base class for all plugins
 */
public class PluginBase {
  protected Bridge bridge;

  public PluginBase() {
  }

  public void setBridge(Bridge bridge) {
    this.bridge = bridge;
  }

  public Context getContext() { return this.bridge.getContext(); }

  public boolean hasPermission(String permission) {
    return ActivityCompat.checkSelfPermission(this.getContext(), permission) == PackageManager.PERMISSION_GRANTED;
  }
}
