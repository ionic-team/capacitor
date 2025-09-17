package com.getcapacitor.plugin;

import android.os.Build;
import android.view.Window;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin
public class SystemBars extends Plugin {
    static final String STYLE_DARK = "DARK";
    static final String STYLE_LIGHT = "LIGHT";

    @Override
    public void load() {
        super.load();
        // inject insets here
    }

    @PluginMethod
    public void setStyle(final PluginCall call) {
        String style = call.getString("style", "");

        getBridge().executeOnMainThread(() -> {
            boolean isLightStyle = false;

            if (style.equals(STYLE_LIGHT)) {
                isLightStyle = true;
            }

            Window window = getActivity().getWindow();
            WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
            windowInsetsControllerCompat.setAppearanceLightStatusBars(isLightStyle);
            windowInsetsControllerCompat.setAppearanceLightNavigationBars(isLightStyle);

            call.resolve();
        });
    }

    @PluginMethod
    public void setHidden(final PluginCall call) {
        boolean hidden = call.getBoolean("hidden", false);
        String inset = call.getString("inset");

        getBridge().executeOnMainThread(() -> {
            Window window = getActivity().getWindow();
            WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
            if (hidden) {
                windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.systemBars());
                call.resolve();
                return;
            }

            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.systemBars());
            call.resolve();
        });
    }
}
