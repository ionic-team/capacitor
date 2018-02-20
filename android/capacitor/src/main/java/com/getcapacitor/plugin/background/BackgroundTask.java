package com.getcapacitor.plugin.background;

import android.app.IntentService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class BackgroundTask extends Plugin {
  public static String TASK_BROADCAST_ACTION = "com.getcapacitor.app.BACKGROUND_TASK_BROADCAST";


  Intent serviceIntent = null;

  private BroadcastReceiver taskReceiver;

  public void load() {
    IntentFilter intentFilter = new IntentFilter(TASK_BROADCAST_ACTION);

    taskReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        String taskId = intent.getStringExtra("taskId");
        // no-op for now
        // callTaskCallback(taskId);
      }
    };

    LocalBroadcastManager.getInstance(getContext()).registerReceiver(taskReceiver, intentFilter);
  }

  private void callTaskCallback(String taskId) {
  }

  @PluginMethod(returnType=PluginMethod.RETURN_CALLBACK)
  public void beforeExit(PluginCall call) {
    String taskId = "";

    /*
    serviceIntent = new Intent(getActivity(), BackgroundTaskService.class);
    serviceIntent.putExtra("taskId", call.getCallbackId());
    getActivity().startService(serviceIntent);
    */

    // No-op for now as Android has less strict requirements for background tasks

    JSObject ret = new JSObject();
    ret.put("taskId", call.getCallbackId());
    call.success(ret);
  }

  @PluginMethod()
  public void finish(PluginCall call) {
    String taskId = call.getString("taskId");
    if (taskId == null) {
      call.error("Must provide taskId");
      return;
    }

    call.success();
  }
}
