package com.getcapacitor.plugin;

import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
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
    static final String STYLE_DARK = "DARK";
    static final String STYLE_DEFAULT = "DEFAULT";
    static final String INSET_TOP = "top";
    static final String INSET_BOTTOM = "bottom";

    @Override
    public void load() {
        super.load();
        initSystemBars();
    }

    private void initSystemBars() {
        boolean enableInsets = getConfig().getBoolean("enableInsets", true);
        String style = getConfig().getString("style", STYLE_DEFAULT).toUpperCase();

        if (enableInsets) {
            setupSafeAreaInsets();
        }

        getBridge().executeOnMainThread(() -> {
            setStyle(style, "");
            initOverlay();
        });
    }

    private void initOverlay() {
        if (Build.VERSION.SDK_INT < 35) {
            Window window = getActivity().getWindow();
            View decorView = window.getDecorView();

            int uiOptions = decorView.getSystemUiVisibility();
            int color;

            uiOptions = uiOptions | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
            color = Color.TRANSPARENT;

            window.getDecorView().setSystemUiVisibility(uiOptions);
            window.setStatusBarColor(color);
            window.setNavigationBarColor(color);
        }
    }

    @PluginMethod
    public void setStyle(final PluginCall call) {
        String inset = call.getString("inset", "").toLowerCase(Locale.US);
        String style = call.getString("style", STYLE_DEFAULT);

        getBridge()
            .executeOnMainThread(() -> {
                setStyle(style, inset);
                call.resolve();
            });
    }

    @PluginMethod
    public void setHidden(final PluginCall call) {
        boolean hidden = call.getBoolean("hidden", false);
        String inset = call.getString("inset", "").toLowerCase(Locale.US);

        getBridge()
            .executeOnMainThread(() -> {
                setHidden(hidden, inset);
                call.resolve();
            });
    }

    private void setupSafeAreaInsets() {
        View decorView = getActivity().getWindow().getDecorView();

        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                // Android 15+ supports edge to edge
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                Insets displayCutout = insets.getInsets(WindowInsetsCompat.Type.displayCutout());

                int top = Math.max(systemBars.top, displayCutout.top);
                int bottom = Math.max(systemBars.bottom, displayCutout.bottom);
                int left = Math.max(systemBars.left, displayCutout.left);
                int right = Math.max(systemBars.right, displayCutout.right);

                injectSafeAreaCSS(top, right, bottom, left);
            } else {
                Insets statusBarInsets = insets.getInsets(WindowInsetsCompat.Type.statusBars());
                Insets navBarInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars());

                injectSafeAreaCSS(statusBarInsets.top, statusBarInsets.right, navBarInsets.bottom, statusBarInsets.left);
            }

            return WindowInsetsCompat.CONSUMED;
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

    private void setStyle(String style, String inset) {
        if (style.equals(STYLE_DEFAULT)) {
            style = getStyleForTheme();
        }

        Window window = getActivity().getWindow();
        WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
        if (inset.isEmpty() || inset.equals(INSET_TOP)) {
            windowInsetsControllerCompat.setAppearanceLightStatusBars(!style.equals(STYLE_DARK));
        }

        if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
            windowInsetsControllerCompat.setAppearanceLightNavigationBars(!style.equals(STYLE_DARK));
        }
    }

    private void setHidden(boolean hide, String inset) {
        Window window = getActivity().getWindow();
        WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());

        if (hide) {
            if (inset.isEmpty() || inset.equals(INSET_TOP)) {
                windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.statusBars());
            }
            if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
                windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.navigationBars());
            }
            return;
        }

        if (inset.isEmpty() || inset.equals(INSET_TOP)) {
            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.systemBars());
        }
        if (inset.isEmpty() || inset.equals(INSET_BOTTOM)) {
            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.navigationBars());
        }
    }

    private String getStyleForTheme() {
        int currentNightMode = getActivity().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (currentNightMode != Configuration.UI_MODE_NIGHT_YES) {
            return STYLE_LIGHT;
        }
        return STYLE_DARK;
    }
}
