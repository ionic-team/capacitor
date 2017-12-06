package com.avocadojs;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import com.avocadojs.android.BuildConfig;

/**
 * Base class for all plugins
 */
public class Plugin {
  protected Bridge bridge;

  public Plugin() {
  }

  public void setBridge(Bridge bridge) {
    this.bridge = bridge;
  }

  public Context getContext() { return this.bridge.getContext(); }
  public Activity getActivity() { return this.bridge.getActivity(); }

  public String getAppId() {
    return getContext().getPackageName();
  }

  public boolean hasPermission(String permission) {
    return ActivityCompat.checkSelfPermission(this.getContext(), permission) == PackageManager.PERMISSION_GRANTED;
  }

  public void requestPermissions(String[] permissions, int requestCode) {
    ActivityCompat.requestPermissions(getActivity(), permissions, requestCode);
  }

  public void requestPermission(String permission, int requestCode) {
    ActivityCompat.requestPermissions(getActivity(), new String[] { permission }, requestCode);
  }

  protected void handleRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {}
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {}

  protected void log(String... args) {
    StringBuffer b = new StringBuffer();
    int i = 0;
    int l = args.length;
    for(String s : args) {
      b.append(s);
      if(i++ < l) b.append(" ");
    }
    Log.d(Bridge.TAG, b.toString());
  }

}
