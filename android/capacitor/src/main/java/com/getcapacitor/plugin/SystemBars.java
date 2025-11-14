package com.getcapacitor.plugin;

import android.content.pm.PackageInfo;
import android.content.res.Configuration;
import android.view.View;
import android.view.Window;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin
public class SystemBars extends Plugin {

    static final String STYLE_LIGHT = "LIGHT";
    static final String STYLE_DARK = "DARK";
    static final String STYLE_DEFAULT = "DEFAULT";
    static final String BAR_STATUS_BAR = "StatusBar";
    static final String BAR_GESTURE_BAR = "NavigationBar";

    static final String viewportMetaJSFunction = """
        function capacitorSystemBarsCheckMetaViewport() {
            const meta = document.querySelectorAll("meta[name=viewport]");
            if (meta.length == 0) {
                return false;
            }
            // get the last found meta viewport tag
            const metaContent = meta[meta.length - 1].content;
            return metaContent.includes("viewport-fit=cover");
        }

        capacitorSystemBarsCheckMetaViewport();
        """;

    @Override
    public void load() {
        super.load();
        initSystemBars();
    }

    private boolean hasFixedWebView() {
        PackageInfo packageInfo = WebViewCompat.getCurrentWebViewPackage(bridge.getContext());
        Pattern pattern = Pattern.compile("(\\d+)");
        Matcher matcher = pattern.matcher(packageInfo.versionName);

        if (!matcher.find()) {
            return false;
        }

        String majorVersionStr = matcher.group(0);
        int majorVersion = Integer.parseInt(majorVersionStr);

        return majorVersion >= 140;
    }

    private void initSystemBars() {
        String style = getConfig().getString("style", STYLE_DEFAULT).toUpperCase(Locale.US);
        boolean hidden = getConfig().getBoolean("hidden", false);
        boolean disableCSSInsets = getConfig().getBoolean("disableInsets", false);

        this.bridge.getWebView().evaluateJavascript(viewportMetaJSFunction, (res) -> {
            boolean hasMetaViewportCover = res.equals("true");
            if (!disableCSSInsets) {
                setupSafeAreaInsets(this.hasFixedWebView(), hasMetaViewportCover);
            }
        });

        getBridge().executeOnMainThread(() -> {
            setStyle(style, "");
            setHidden(hidden, "");
        });
    }

    @PluginMethod
    public void setStyle(final PluginCall call) {
        String bar = call.getString("bar", "");
        String style = call.getString("style", STYLE_DEFAULT);

        getBridge().executeOnMainThread(() -> {
            setStyle(style, bar);
            call.resolve();
        });
    }

    @PluginMethod
    public void show(final PluginCall call) {
        String bar = call.getString("bar", "");

        getBridge().executeOnMainThread(() -> {
            setHidden(false, bar);
            call.resolve();
        });
    }

    @PluginMethod
    public void hide(final PluginCall call) {
        String bar = call.getString("bar", "");

        getBridge().executeOnMainThread(() -> {
            setHidden(true, bar);
            call.resolve();
        });
    }

    @PluginMethod
    public void setAnimation(final PluginCall call) {
        call.resolve();
    }

    private void setupSafeAreaInsets(boolean hasFixedWebView, boolean hasMetaViewportCover) {
        ViewCompat.setOnApplyWindowInsetsListener((View) getBridge().getWebView().getParent(), (v, insets) -> {
            if (hasFixedWebView && hasMetaViewportCover) {
                return insets;
            }

            Insets safeArea = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            int bottomInsets = safeArea.bottom;

            if (keyboardVisible) {
                // When https://issues.chromium.org/issues/457682720 is fixed and released,
                // add behind a WebView version check
                bottomInsets = imeInsets.bottom - bottomInsets;
            }

            injectSafeAreaCSS(safeArea.top, safeArea.right, bottomInsets, safeArea.left);

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
        getBridge().executeOnMainThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String script = String.format(
                    Locale.US,
                    """
                    try {
                      document.documentElement.style.setProperty("--safe-area-inset-top", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-right", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-bottom", "%dpx");
                      document.documentElement.style.setProperty("--safe-area-inset-left", "%dpx");
                    } catch(e) { console.error('Error injecting safe area CSS:', e); }
                    """,
                    (int) topPx,
                    (int) rightPx,
                    (int) bottomPx,
                    (int) leftPx
                );

                bridge.getWebView().evaluateJavascript(script, null);
            }
        });
    }

    private void setStyle(String style, String bar) {
        if (style.equals(STYLE_DEFAULT)) {
            style = getStyleForTheme();
        }

        Window window = getActivity().getWindow();
        WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
        if (bar.isEmpty() || bar.equals(BAR_STATUS_BAR)) {
            windowInsetsControllerCompat.setAppearanceLightStatusBars(!style.equals(STYLE_DARK));
        }

        if (bar.isEmpty() || bar.equals(BAR_GESTURE_BAR)) {
            windowInsetsControllerCompat.setAppearanceLightNavigationBars(!style.equals(STYLE_DARK));
        }
    }

    private void setHidden(boolean hide, String bar) {
        Window window = getActivity().getWindow();
        WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());

        if (hide) {
            if (bar.isEmpty() || bar.equals(BAR_STATUS_BAR)) {
                windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.statusBars());
            }
            if (bar.isEmpty() || bar.equals(BAR_GESTURE_BAR)) {
                windowInsetsControllerCompat.hide(WindowInsetsCompat.Type.navigationBars());
            }
            return;
        }

        if (bar.isEmpty() || bar.equals(BAR_STATUS_BAR)) {
            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.systemBars());
        }
        if (bar.isEmpty() || bar.equals(BAR_GESTURE_BAR)) {
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
