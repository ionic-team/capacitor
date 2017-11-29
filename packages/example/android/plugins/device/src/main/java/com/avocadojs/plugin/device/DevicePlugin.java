package com.avocadojs.plugin.device;

import android.provider.Settings;

import com.avocadojs.Avocado;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginResult;


public class DevicePlugin extends Plugin {

    public DevicePlugin(Avocado avocado) {
        super(avocado, "com.avocadojs.plugin.device");
    }

    public void getInfo(PluginCall call) {
        PluginResult r = new PluginResult();

        r.put("uuid", this.getUuid());
        r.put("version", android.os.Build.VERSION.RELEASE);
        r.put("platform", this.getPlatform());
        r.put("model", android.os.Build.MODEL);
        r.put("manufacturer", android.os.Build.MANUFACTURER);
        r.put("isVirtual", this.isVirtual());
        r.put("serial", android.os.Build.SERIAL);

        call.successCallback(r);
    }

    String getPlatform() {
        if (android.os.Build.MANUFACTURER.equals("Amazon")) {
            return "amazon-fireos";
        }
        return "Android";
    }

    String getUuid() {
        return Settings.Secure.getString(this.avocado.getContext().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
    }

    boolean isVirtual() {
        return android.os.Build.FINGERPRINT.contains("generic") || android.os.Build.PRODUCT.contains("sdk");
    }

}
