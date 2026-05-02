package com.getcapacitor.plugin;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Build;
import android.util.TypedValue;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.WebViewListener;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

@CapacitorPlugin
public class SystemBars extends Plugin {

    static final String STYLE_LIGHT = "LIGHT";
    static final String STYLE_DARK = "DARK";
    static final String STYLE_DEFAULT = "DEFAULT";
    static final String BAR_STATUS_BAR = "StatusBar";
    static final String BAR_GESTURE_BAR = "NavigationBar";

    static final String INSETS_HANDLING_CSS = "css";
    static final String INSETS_HANDLING_DISABLE = "disable";

    // https://issues.chromium.org/issues/40699457
    private static final int WEBVIEW_VERSION_WITH_SAFE_AREA_FIX = 140;
    // https://issues.chromium.org/issues/457682720
    private static final int WEBVIEW_VERSION_WITH_SAFE_AREA_KEYBOARD_FIX = 144;

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

    private boolean insetHandlingEnabled = true;
    private boolean hasViewportCover = false;

    private String currentStatusBarStyle = STYLE_DEFAULT;
    private String currentGestureBarStyle = STYLE_DEFAULT;

    private boolean navBarVisible = true;

    @Override
    public void load() {
        getBridge().getWebView().addJavascriptInterface(this, "CapacitorSystemBarsAndroidInterface");
        super.load();

        initSystemBars();
    }

    @Override
    protected void handleOnStart() {
        super.handleOnStart();

        this.getBridge().addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageCommitVisible(WebView view, String url) {
                    super.onPageCommitVisible(view, url);
                    View parentView = (View) getBridge().getWebView().getParent();
                    ViewCompat.requestApplyInsets(parentView);
                    if (insetHandlingEnabled) {
                        WindowInsetsCompat rootInsets = ViewCompat.getRootWindowInsets(parentView);
                        if (rootInsets != null) {
                            Insets safeArea = calcSafeAreaInsets(rootInsets);
                            injectSafeAreaCSS(safeArea.top, safeArea.right, safeArea.bottom, safeArea.left);
                        }
                    }
                }
            }
        );
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);

        setStyle(currentGestureBarStyle, BAR_GESTURE_BAR);
        setStyle(currentStatusBarStyle, BAR_STATUS_BAR);
    }

    private void initSystemBars() {
        String style = getConfig().getString("style", STYLE_DEFAULT).toUpperCase(Locale.US);
        boolean hidden = getConfig().getBoolean("hidden", false);

        String insetsHandling = getConfig().getString("insetsHandling", "css");
        if (insetsHandling.equals(INSETS_HANDLING_DISABLE)) {
            insetHandlingEnabled = false;
        }

        initWindowInsetsListener();
        initSafeAreaCSSVariables();

        getBridge().executeOnMainThread(() -> {
            Window window = getActivity().getWindow();
            WindowCompat.setDecorFitsSystemWindows(window, false);
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.VANILLA_ICE_CREAM) {
                window.setNavigationBarColor(android.graphics.Color.TRANSPARENT);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    window.setNavigationBarContrastEnforced(false);
                }
            }
            setStyle(style, "");
            setHidden(hidden, "");
            ViewCompat.requestApplyInsets((View) getBridge().getWebView().getParent());
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

    @JavascriptInterface
    public void onDOMReady() {
        getActivity().runOnUiThread(() -> {
            this.bridge.getWebView().evaluateJavascript(viewportMetaJSFunction, (res) -> {
                hasViewportCover = res.equals("true");
                ViewCompat.requestApplyInsets((View) getBridge().getWebView().getParent());
            });
        });
    }

    private Insets calcSafeAreaInsets(WindowInsetsCompat insets) {
        Insets safeArea = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());

        int bottom = safeArea.bottom;

        if (bottom == 0
                && Build.VERSION.SDK_INT < Build.VERSION_CODES.R
                && safeArea.left == 0 && safeArea.right == 0) { // skip if nav bar is on a side (landscape)
            bottom = getNavBarHeightFromResources();
        }

        boolean imeVisible = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? insets.isVisible(WindowInsetsCompat.Type.ime())
                : insets.getInsets(WindowInsetsCompat.Type.ime()).bottom > 0;

        if (imeVisible) {
            return Insets.of(safeArea.left, safeArea.top, safeArea.right, 0);
        }
        return Insets.of(safeArea.left, safeArea.top, safeArea.right, bottom);
    }

    private int getNavBarHeightFromResources() {
        if (!navBarVisible) return 0;
        android.content.res.Resources res = getActivity().getResources();
        int heightId = res.getIdentifier("navigation_bar_height", "dimen", "android");
        return heightId > 0 ? res.getDimensionPixelSize(heightId) : 0;
    }

    private void initSafeAreaCSSVariables() {
        if (insetHandlingEnabled) {
            View v = (View) this.getBridge().getWebView().getParent();
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(v);
            if (insets != null) {
                Insets safeAreaInsets = calcSafeAreaInsets(insets);
                injectSafeAreaCSS(safeAreaInsets.top, safeAreaInsets.right, safeAreaInsets.bottom, safeAreaInsets.left);
            }
        }
    }

    private void initWindowInsetsListener() {
        ViewCompat.setOnApplyWindowInsetsListener((View) getBridge().getWebView().getParent(), (v, insets) -> {
            // getRootWindowInsets() bypasses AppCompat's intermediate view consuming the bottom inset on API < 30
            WindowInsetsCompat rawInsets = ViewCompat.getRootWindowInsets(v);
            WindowInsetsCompat safeAreaSource = (rawInsets != null) ? rawInsets : insets;

            boolean shouldPassthroughInsets = getWebViewMajorVersion() >= WEBVIEW_VERSION_WITH_SAFE_AREA_FIX && hasViewportCover;

            Insets systemBarsInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            if (shouldPassthroughInsets) {
                // We need to correct for a possible shown IME
                v.setPadding(0, 0, 0, keyboardVisible ? imeInsets.bottom : 0);

                if (hasViewportCover && insetHandlingEnabled) {
                    Insets safeAreaInsets = calcSafeAreaInsets(safeAreaSource);
                    injectSafeAreaCSS(safeAreaInsets.top, safeAreaInsets.right, safeAreaInsets.bottom, safeAreaInsets.left);
                }

                return new WindowInsetsCompat.Builder(insets)
                    .setInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(),
                        Insets.of(
                            systemBarsInsets.left,
                            systemBarsInsets.top,
                            systemBarsInsets.right,
                            getBottomInset(systemBarsInsets, keyboardVisible)
                        )
                    )
                    .build();
            }

            v.setPadding(0, 0, 0, keyboardVisible ? imeInsets.bottom : 0);

            // Returning `WindowInsetsCompat.CONSUMED` breaks recalculation of safe area insets
            // So we have to explicitly set insets to `0`
            // See: https://issues.chromium.org/issues/461332423
            WindowInsetsCompat newInsets = new WindowInsetsCompat.Builder(insets)
                .setInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(), Insets.of(0, 0, 0, 0))
                .build();

            if (insetHandlingEnabled) {
                Insets safeAreaInsets = calcSafeAreaInsets(safeAreaSource);
                injectSafeAreaCSS(safeAreaInsets.top, safeAreaInsets.right, safeAreaInsets.bottom, safeAreaInsets.left);
            }

            return newInsets;
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
        String requestedStyle = style;
        if (style.equals(STYLE_DEFAULT)) {
            style = getStyleForTheme();
        }

        Window window = getActivity().getWindow();
        WindowInsetsControllerCompat windowInsetsControllerCompat = WindowCompat.getInsetsController(window, window.getDecorView());
        if (bar.isEmpty() || bar.equals(BAR_STATUS_BAR)) {
            currentStatusBarStyle = requestedStyle;
            windowInsetsControllerCompat.setAppearanceLightStatusBars(!style.equals(STYLE_DARK));
        }

        if (bar.isEmpty() || bar.equals(BAR_GESTURE_BAR)) {
            currentGestureBarStyle = requestedStyle;
            windowInsetsControllerCompat.setAppearanceLightNavigationBars(!style.equals(STYLE_DARK));
        }

        getActivity().getWindow().getDecorView().setBackgroundColor(getThemeColor(getContext(), android.R.attr.windowBackground));
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
                navBarVisible = false;
            }
            return;
        }

        if (bar.isEmpty() || bar.equals(BAR_STATUS_BAR)) {
            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.systemBars());
        }
        if (bar.isEmpty() || bar.equals(BAR_GESTURE_BAR)) {
            windowInsetsControllerCompat.show(WindowInsetsCompat.Type.navigationBars());
            navBarVisible = true;
        }
    }

    private String getStyleForTheme() {
        int currentNightMode = getActivity().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (currentNightMode != Configuration.UI_MODE_NIGHT_YES) {
            return STYLE_LIGHT;
        }
        return STYLE_DARK;
    }

    public int getThemeColor(Context context, int attrRes) {
        TypedValue typedValue = new TypedValue();

        Resources.Theme theme = context.getTheme();
        theme.resolveAttribute(attrRes, typedValue, true);
        return typedValue.data;
    }

    private Integer getWebViewMajorVersion() {
        PackageInfo info = WebViewCompat.getCurrentWebViewPackage(getContext());
        if (info != null && info.versionName != null) {
            String[] versionSegments = info.versionName.split("\\.");
            return Integer.valueOf(versionSegments[0]);
        }

        return 0;
    }

    private int getBottomInset(Insets systemBarsInsets, boolean keyboardVisible) {
        if (getWebViewMajorVersion() < WEBVIEW_VERSION_WITH_SAFE_AREA_KEYBOARD_FIX) {
            // This is a workaround for webview versions that have a bug
            // that causes the bottom inset to be incorrect if the IME is visible
            // See: https://issues.chromium.org/issues/457682720

            if (keyboardVisible) {
                return 0;
            }
        }

        return systemBarsInsets.bottom;
    }
}
