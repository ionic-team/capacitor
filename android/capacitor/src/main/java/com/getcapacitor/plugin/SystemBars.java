package com.getcapacitor.plugin;

import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

@CapacitorPlugin
public class SystemBars extends Plugin {
    static final String STYLE_LIGHT = "LIGHT";
    static final String INSET_TOP = "top";
    static final String INSET_BOTTOM = "bottom";
    static final String INSET_LEFT = "left";
    static final String INSET_RIGHT = "right";

    @Override
    public void load() {
        super.load();
        setupSafeAreaInsets();
    }

    @PluginMethod
    public void setStyle(final PluginCall call) {
        boolean isLightStyle;

        String inset = call.getString("inset", "").toLowerCase(Locale.US);
        String style = call.getString("style", "");

        if (style.equals(STYLE_LIGHT)) {
            isLightStyle = true;
        } else {
            isLightStyle = false;
        }

        getBridge()
            .executeOnMainThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
                if (inset.isEmpty() || inset.equals(INSET_TOP)) {
                    windowInsetsControllerCompat.setAppearanceLightStatusBars(isLightStyle);
                }

                if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
                    windowInsetsControllerCompat.setAppearanceLightNavigationBars(isLightStyle);
                }

                call.resolve();
            });
    }

    @PluginMethod
    public void setHidden(final PluginCall call) {
        boolean hidden = call.getBoolean("hidden", false);
        String inset = call.getString("inset", "").toLowerCase(Locale.US);

        getBridge()
            .executeOnMainThread(() -> {
                Window window = getActivity().getWindow();
                WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
                if (hidden) {
                    if (inset.isEmpty() || inset.equals(INSET_TOP)) {
                        windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.statusBars());
                    }
                    if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
                        windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.navigationBars());
                    }

                    call.resolve();
                    return;
                }

                if (inset.isEmpty() || inset.equals(INSET_TOP)) {
                    windowInsetsControllerCompat.show(WindowInsetsCompat.Type.statusBars());
                }
                if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
                    windowInsetsControllerCompat.show(WindowInsetsCompat.Type.navigationBars());
                }
                
                call.resolve();
            });
    }

    private void setupSafeAreaInsets() {
        View decorView = getActivity().getWindow().getDecorView();

        decorView.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                // Android 15+ supports edge to edge
                android.graphics.Insets systemBars = insets.getInsets(WindowInsets.Type.systemBars());
                android.graphics.Insets displayCutout = insets.getInsets(WindowInsets.Type.displayCutout());

                int top = Math.max(systemBars.top, displayCutout.top);
                int bottom = Math.max(systemBars.bottom, displayCutout.bottom);
                int left = Math.max(systemBars.left, displayCutout.left);
                int right = Math.max(systemBars.right, displayCutout.right);

                injectSafeAreaCSS(top, right, bottom, left);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                injectSafeAreaCSS(0, 0, 0, 0);
            }

            return insets;
        });
    }

    private void injectSafeAreaCSS(int top, int right, int bottom, int left) {
        // Convert pixels to density-independent pixels
        float density = getActivity().getResources().getDisplayMetrics().density;
        float topPx = top / density;
        float rightPx = right / density;
        float bottomPx = bottom / density;
        float leftPx = left / density;

        // Execute JavaScript to inject the CSS
        getBridge()
            .executeOnMainThread(() -> {
                if (bridge != null && bridge.getWebView() != null) {
                    String script = String.format(
                        Locale.US,
                        """
                        try {
                          document.documentElement.style.setProperty("--safe-area-inset-top", "%dpx");
                          document.documentElement.style.setProperty("--safe-area-inset-right", "%dpx");
                          document.documentElement.style.setProperty("--safe-area-inset-bottom", "%dpx");
                          document.documentElement.style.setProperty("--safe-area-inset-left", "%dpx");
                          window.dispatchEvent(new CustomEvent('safeAreaChanged'));
                        } catch(e) { console.error('Error injecting safe area CSS:', e); }
                        """,
                        (int) topPx,
                        (int) rightPx,
                        (int) bottomPx,
                        (int) leftPx
                    );

                    bridge.getWebView().evaluateJavascript(script, null);

                    Logger.info("Safe area insets injected (edge-to-edge: enabled)");
                }
            });
    }
}
