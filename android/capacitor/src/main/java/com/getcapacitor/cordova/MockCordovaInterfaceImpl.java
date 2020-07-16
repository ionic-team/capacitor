package com.getcapacitor.cordova;

import android.app.Activity;
import java.util.concurrent.Executors;
import org.apache.cordova.CordovaInterfaceImpl;
import org.apache.cordova.CordovaPlugin;

public class MockCordovaInterfaceImpl extends CordovaInterfaceImpl {

    public MockCordovaInterfaceImpl(Activity activity) {
        super(activity, Executors.newCachedThreadPool());
    }

    public CordovaPlugin getActivityResultCallback() {
        return this.activityResultCallback;
    }
}
