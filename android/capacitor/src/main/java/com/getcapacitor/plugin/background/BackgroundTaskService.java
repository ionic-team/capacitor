package com.getcapacitor.plugin.background;

import android.app.IntentService;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.getcapacitor.Bridge;

public class BackgroundTaskService extends IntentService {
  public BackgroundTaskService() {
    super("CapacitorBackgroundTaskService");
  }

  @Override
  protected void onHandleIntent(Intent intent) {
    // Gets data from the incoming Intent
    String taskId = intent.getStringExtra("taskId");
    Log.d(Bridge.TAG, "Doing background task: " + taskId);

    Intent localIntent = new Intent(BackgroundTask.TASK_BROADCAST_ACTION)
        .putExtra("taskId", taskId);
    LocalBroadcastManager.getInstance(this).sendBroadcast(localIntent);
    // Do work here, based on the contents of dataString
  }
}
