package com.getcapacitor.plugin;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Build;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewGroup;
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

    private static final int MIN_INSETS_VERSION = Build.VERSION_CODES.LOLLIPOP;

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

    static final String VIEWPORT_META_JS = """
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
    private Integer cachedWebViewMajorVersion;

    private String currentStyle = STYLE_DEFAULT;

    @Override
    public void load() {
        getBridge().getWebView().addJavascriptInterface(this, "CapacitorSystemBarsAndroidInterface");
        super.load();

        initSystemBars();

        getBridge().executeOnMainThread(() -> {
            WindowCompat.setDecorFitsSystemWindows(getActivity().getWindow(), true);
            getBridge().getWebView().requestApplyInsets();
        });
    }

    @Override
    protected void handleOnStart() {
        super.handleOnStart();

        this.getBridge().addWebViewListener(
            new WebViewListener() {
                @Override
                public void onPageCommitVisible(WebView view, String url) {
                    super.onPageCommitVisible(view, url);
                    getBridge().getWebView().requestApplyInsets();
                }
            }
        );
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        getBridge().executeOnMainThread(() -> {
            WindowCompat.setDecorFitsSystemWindows(getActivity().getWindow(), true);
            getBridge().getWebView().requestApplyInsets();
        });
    }

    @Override
    protected void handleOnConfigurationChanged(Configuration newConfig) {
        super.handleOnConfigurationChanged(newConfig);

        setStyle(currentStyle, "");
    }

    private void initSystemBars() {
        String style = getConfig().getString("style", STYLE_DEFAULT).toUpperCase(Locale.US);
        boolean hidden = getConfig().getBoolean("hidden", false);

        String insetsHandling = getConfig().getString("insetsHandling", INSETS_HANDLING_CSS);
        if (INSETS_HANDLING_DISABLE.equals(insetsHandling)) {
            insetHandlingEnabled = false;
        }

        initWindowInsetsListener();
        initSafeAreaCSSVariables();

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
            setStyle(style != null ? style : STYLE_DEFAULT, bar);
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
        getActivity().runOnUiThread(() ->
            this.bridge.getWebView().evaluateJavascript(VIEWPORT_META_JS, (res) -> {
                hasViewportCover = res.equals("true");

                WindowCompat.setDecorFitsSystemWindows(getActivity().getWindow(), true);
                getBridge().getWebView().requestApplyInsets();
            })
        );
    }

    private Insets calcSafeAreaInsets(WindowInsetsCompat insets) {
        Insets safeArea = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
        if (insets.isVisible(WindowInsetsCompat.Type.ime())) {
            return Insets.of(safeArea.left, safeArea.top, safeArea.right, 0);
        }
        return Insets.of(safeArea.left, safeArea.top, safeArea.right, safeArea.bottom);
    }

    private void initSafeAreaCSSVariables() {
        if (Build.VERSION.SDK_INT >= MIN_INSETS_VERSION && insetHandlingEnabled) {
            View v = (View) this.getBridge().getWebView().getParent();
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(v);
            if (insets != null) {
                Insets safeAreaInsets = calcSafeAreaInsets(insets);
                boolean isApiLowerThan30 = Build.VERSION.SDK_INT < Build.VERSION_CODES.R;

                if (isApiLowerThan30) {
                    injectSafeAreaCSSWithBottom(0, safeAreaInsets.right, safeAreaInsets.bottom, safeAreaInsets.left);
                } else {
                    injectSafeAreaCSS(safeAreaInsets.top, safeAreaInsets.right, safeAreaInsets.bottom, safeAreaInsets.left);
                }
            }
        }
    }

    private void initWindowInsetsListener() {
        if (Build.VERSION.SDK_INT >= MIN_INSETS_VERSION && insetHandlingEnabled) {
            View parentView = (View) getBridge().getWebView().getParent();
            ViewCompat.setOnApplyWindowInsetsListener(parentView, this::applyInsets);
        }
    }

    private WindowInsetsCompat applyInsets(View v, WindowInsetsCompat insets) {
        int webViewVersion = getWebViewMajorVersion();
        boolean hasBrokenWebViewVersion = webViewVersion < WEBVIEW_VERSION_WITH_SAFE_AREA_FIX;
        boolean hasModernWebView = !hasBrokenWebViewVersion;
        boolean isApiLowerThan30 = Build.VERSION.SDK_INT < Build.VERSION_CODES.R;
        boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

        Insets stableInsets = insets.getInsetsIgnoringVisibility(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
        Insets currentInsets = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());

        if (isApiLowerThan30 && hasBrokenWebViewVersion && hasViewportCover && v.hasWindowFocus() && v.isShown()) {
            setViewMargins(v, Insets.NONE);
            int bottomInset = keyboardVisible ? 0 : stableInsets.bottom;
            injectSafeAreaCSSWithBottom(0, currentInsets.right, bottomInset, currentInsets.left);
            return WindowInsetsCompat.CONSUMED;
        }

        if (isApiLowerThan30 && hasModernWebView && hasViewportCover) {
            resetViewBottomMargin(v);
            int bottomInset = keyboardVisible ? 0 : stableInsets.bottom;
            injectSafeAreaCSSWithBottom(0, stableInsets.right, bottomInset, stableInsets.left);
            return insets;
        }

        if (hasViewportCover && !(isApiLowerThan30 && hasBrokenWebViewVersion)) {
            int topInset = stableInsets.top;
            int bottomInset = keyboardVisible ? 0 : currentInsets.bottom;

            injectSafeAreaCSSWithBottom(topInset, currentInsets.right, bottomInset, currentInsets.left);
        }

        resetViewBottomMargin(v);

        if (hasViewportCover && webViewVersion < WEBVIEW_VERSION_WITH_SAFE_AREA_KEYBOARD_FIX && keyboardVisible) {
            return new WindowInsetsCompat.Builder(insets)
                .setInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout(),
                    Insets.of(currentInsets.left, currentInsets.top, currentInsets.right, 0)
                ).build();
        }

        return insets;
    }

    private void resetViewBottomMargin(View v) {
        ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
        if (mlp.leftMargin != 0 || mlp.topMargin != 0 || mlp.rightMargin != 0 || mlp.bottomMargin != 0) {
            mlp.leftMargin = 0;
            mlp.topMargin = 0;
            mlp.rightMargin = 0;
            mlp.bottomMargin = 0;
            v.setLayoutParams(mlp);
        }
    }

    private void setViewMargins(View v, Insets insets) {
        ViewGroup.MarginLayoutParams mlp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
        mlp.leftMargin = insets.left;
        mlp.bottomMargin = insets.bottom;
        mlp.rightMargin = insets.right;
        mlp.topMargin = insets.top;
        v.setLayoutParams(mlp);
    }

    private void injectSafeAreaCSSWithBottom(int top, int right, int bottom, int left) {
        float density = getActivity().getResources().getDisplayMetrics().density;
        int topPx = (int) (top / density);
        int rightPx = (int) (right / density);
        int bottomPx = (int) (bottom / density);
        int leftPx = (int) (left / density);
        injectSafeAreaCSSPixels(topPx, rightPx, bottomPx, leftPx);
    }

    private void injectSafeAreaCSS(int top, int right, int bottom, int left) {
        float density = getActivity().getResources().getDisplayMetrics().density;
        int topPx = (int) (top / density);
        int rightPx = (int) (right / density);
        int bottomPx = (int) (bottom / density);
        int leftPx = (int) (left / density);

        injectSafeAreaCSSPixels(topPx, rightPx, bottomPx, leftPx);
    }

    private void injectSafeAreaCSSPixels(int topPx, int rightPx, int bottomPx, int leftPx) {
        getBridge().executeOnMainThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                String script =
                    "try {" +
                    "const style = document.documentElement.style;" +
                    "style.removeProperty('--safe-area-inset-top');" +
                    "style.removeProperty('--safe-area-inset-right');" +
                    "style.removeProperty('--safe-area-inset-bottom');" +
                    "style.removeProperty('--safe-area-inset-left');" +
                    "for (const name of Array.from(style)) {" +
                    "  if (name.startsWith('--safe-area-inset-top') && name !== '--safe-area-inset-top') style.removeProperty(name);" +
                    "  if (name.startsWith('--safe-area-inset-right') && name !== '--safe-area-inset-right') style.removeProperty(name);" +
                    "  if (name.startsWith('--safe-area-inset-bottom') && name !== '--safe-area-inset-bottom') style.removeProperty(name);" +
                    "  if (name.startsWith('--safe-area-inset-left') && name !== '--safe-area-inset-left') style.removeProperty(name);" +
                    "}" +
                    "style.setProperty('--safe-area-inset-top', '" + topPx + "px');" +
                    "style.setProperty('--safe-area-inset-right', '" + rightPx + "px');" +
                    "style.setProperty('--safe-area-inset-bottom', '" + bottomPx + "px');" +
                    "style.setProperty('--safe-area-inset-left', '" + leftPx + "px');" +
                    "} catch (e) {}";

                bridge.getWebView().evaluateJavascript(script, null);
            }
        });
    }

    private void setStyle(String style, String bar) {
        currentStyle = style;

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

    public int getThemeColor(Context context, int attrRes) {
        TypedValue typedValue = new TypedValue();

        Resources.Theme theme = context.getTheme();
        theme.resolveAttribute(attrRes, typedValue, true);
        return typedValue.data;
    }

    private int getWebViewMajorVersion() {
        if (cachedWebViewMajorVersion != null) {
            return cachedWebViewMajorVersion;
        }

        PackageInfo info = WebViewCompat.getCurrentWebViewPackage(getContext());
        if (info != null && info.versionName != null) {
            String[] versionSegments = info.versionName.split("\\.");
            try {
                cachedWebViewMajorVersion = Integer.valueOf(versionSegments[0]);
                return cachedWebViewMajorVersion;
            } catch (NumberFormatException ignored) {}
        }

        cachedWebViewMajorVersion = 0;
        return 0;
    }
}
