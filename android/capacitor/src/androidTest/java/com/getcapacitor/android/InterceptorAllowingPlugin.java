package com.getcapacitor.android;

import android.net.Uri;
import com.getcapacitor.Bridge;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

/** A plugin that tries to allow the proxy path. The navigation guard must ignore it. */
@CapacitorPlugin(name = "InterceptorAllowingPlugin")
public class InterceptorAllowingPlugin extends Plugin {

    @Override
    public Boolean shouldOverrideLoad(Uri url) {
        String path = url.getPath();
        if (path != null && path.startsWith(Bridge.CAPACITOR_HTTP_INTERCEPTOR_START)) {
            return false; // "allow this navigation"
        }
        return null;
    }
}
