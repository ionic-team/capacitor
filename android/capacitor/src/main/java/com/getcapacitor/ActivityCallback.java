package com.getcapacitor;

import androidx.activity.result.ActivityResult;

public interface ActivityCallback {
    void onResult(PluginCall call, ActivityResult result);
}
