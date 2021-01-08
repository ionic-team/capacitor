package com.getcapacitor.cordova;

import android.app.Activity;
import android.util.Pair;
import java.util.concurrent.Executors;
import org.apache.cordova.CordovaInterfaceImpl;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONException;

public class MockCordovaInterfaceImpl extends CordovaInterfaceImpl {

    public MockCordovaInterfaceImpl(Activity activity) {
        super(activity, Executors.newCachedThreadPool());
    }

    public CordovaPlugin getActivityResultCallback() {
        return this.activityResultCallback;
    }

    /**
     * Checks Cordova permission callbacks to handle permissions defined by a Cordova plugin.
     * Returns true if Cordova is handling the permission request with a registered code.
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     * @return true if Cordova handled the permission request, false if not
     */
    public boolean handlePermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
        Pair<CordovaPlugin, Integer> callback = permissionResultCallbacks.getAndRemoveCallback(requestCode);
        if (callback != null) {
            callback.first.onRequestPermissionResult(callback.second, permissions, grantResults);
            return true;
        }

        return false;
    }
}
