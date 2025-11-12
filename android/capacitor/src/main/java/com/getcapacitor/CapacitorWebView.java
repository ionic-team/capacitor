package com.getcapacitor;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.KeyEvent;
import android.view.inputmethod.BaseInputConnection;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.view.ViewGroup.MarginLayoutParams;
import android.os.Build;
import android.content.res.Resources;
import android.util.DisplayMetrics;

public class CapacitorWebView extends WebView {

    private BaseInputConnection capInputConnection;
    private Bridge bridge;

    public CapacitorWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void setBridge(Bridge bridge) {
        this.bridge = bridge;
    }
    
    /**
     * Handle keyboard visibility changes to ensure input fields remain visible
     */
    private void handleKeyboardVisibility(boolean isVisible, int keyboardHeight) {
        if (Build.VERSION.SDK_INT >= 34) {
            post(() -> {
                if (isVisible) {
                    // Scroll to focused element when keyboard appears
                    evaluateJavascript(
                        "(function() {" +
                        "  var focused = document.activeElement;" +
                        "  if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {" +
                        "    var rect = focused.getBoundingClientRect();" +
                        "    var viewportHeight = window.innerHeight;" +
                        "    var keyboardHeight = " + keyboardHeight + ";" +
                        "    if (rect.bottom > (viewportHeight - keyboardHeight)) {" +
                        "      var scrollOffset = rect.bottom - (viewportHeight - keyboardHeight) + 20;" +
                        "      window.scrollBy(0, scrollOffset);" +
                        "    }" +
                        "  }" +
                        "})();", null
                    );
                }
            });
        }
    }
    
    /**
     * Calculate navigation bar height for viewport correction
     */
    private int getNavigationBarHeight() {
        Resources resources = getContext().getResources();
        int resourceId = resources.getIdentifier("navigation_bar_height", "dimen", "android");
        if (resourceId > 0) {
            return resources.getDimensionPixelSize(resourceId);
        }
        // Fallback: estimate based on screen density
        DisplayMetrics metrics = resources.getDisplayMetrics();
        return (int) (48 * metrics.density); // 48dp standard navigation bar
    }
    
    /**
     * Fix viewport calculations for Android < 15 by injecting corrected values
     */
    private void correctViewportForLegacyAndroid(int navigationBarHeight, int keyboardHeight) {
        if (Build.VERSION.SDK_INT < 34) {
            post(() -> {
                String script = 
                    "(function() {" +
                    "  var navBarHeight = " + navigationBarHeight + ";" +
                    "  var keyboardHeight = " + keyboardHeight + ";" +
                    "  var correctedHeight = window.innerHeight;" +
                    "  " +
                    "  if (keyboardHeight > 0 && navBarHeight > 0) {" +
                    "    correctedHeight = window.innerHeight - navBarHeight;" +
                    "  }" +
                    "  " +
                    "  // Override visualViewport.height if available" +
                    "  if (window.visualViewport) {" +
                    "    Object.defineProperty(window.visualViewport, 'height', {" +
                    "      get: function() { return correctedHeight; }," +
                    "      configurable: true" +
                    "    });" +
                    "  }" +
                    "  " +
                    "  // Store corrected values for CSS env() variables" +
                    "  window.Capacitor = window.Capacitor || {};" +
                    "  window.Capacitor.safeAreaInsets = window.Capacitor.safeAreaInsets || {};" +
                    "  window.Capacitor.safeAreaInsets.bottom = navBarHeight;" +
                    "  " +
                    "  // Inject CSS custom properties for safe area insets" +
                    "  var style = document.getElementById('capacitor-safe-area-insets');" +
                    "  if (!style) {" +
                    "    style = document.createElement('style');" +
                    "    style.id = 'capacitor-safe-area-insets';" +
                    "    document.head.appendChild(style);" +
                    "  }" +
                    "  style.textContent = ':root { --safe-area-inset-bottom: ' + navBarHeight + 'px; }';" +
                    "  " +
                    "  // Dispatch resize event to notify components" +
                    "  window.dispatchEvent(new Event('resize'));" +
                    "})();"; 
                evaluateJavascript(script, null);
            });
        }
    }

    @Override
    public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
        CapConfig config;
        if (bridge != null) {
            config = bridge.getConfig();
        } else {
            config = CapConfig.loadDefault(getContext());
        }

        boolean captureInput = config.isInputCaptured();
        if (captureInput) {
            if (capInputConnection == null) {
                capInputConnection = new BaseInputConnection(this, false);
            }
            return capInputConnection;
        }
        return super.onCreateInputConnection(outAttrs);
    }

    @Override
    @SuppressWarnings("deprecation")
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_MULTIPLE) {
            evaluateJavascript("document.activeElement.value = document.activeElement.value + '" + event.getCharacters() + "';", null);
            return false;
        }
        return super.dispatchKeyEvent(event);
    }

    public void edgeToEdgeHandler(Bridge bridge) {
        String configEdgeToEdge = bridge.getConfig().adjustMarginsForEdgeToEdge();

        if (configEdgeToEdge.equals("disable")) return;

        boolean autoMargins = false;
        boolean forceMargins = configEdgeToEdge.equals("force");

        // Handle Android 15+ edge-to-edge enforcement
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM && configEdgeToEdge.equals("auto")) {
            TypedValue value = new TypedValue();
            boolean foundOptOut = getContext().getTheme().resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);
            boolean optOutValue = value.data != 0;
            autoMargins = !(foundOptOut && optOutValue);
        }
        
        // Force margins for Android 15+ when edge-to-edge is enabled
        if (Build.VERSION.SDK_INT >= 34 && configEdgeToEdge.equals("force")) {
            forceMargins = true;
        }

        if (forceMargins || autoMargins) {
            ViewCompat.setOnApplyWindowInsetsListener(this, (v, windowInsets) -> {
                Insets systemInsets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
                Insets imeInsets = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                
                // Android 15+ keyboard handling
                if (Build.VERSION.SDK_INT >= 34) {
                    MarginLayoutParams mlp = (MarginLayoutParams) v.getLayoutParams();
                    
                    // Apply system insets
                    mlp.leftMargin = systemInsets.left;
                    mlp.rightMargin = systemInsets.right;
                    mlp.topMargin = systemInsets.top;
                    
                    // Handle keyboard visibility for Android 15+
                    if (imeInsets.bottom > 0) {
                        // Keyboard is visible - ensure input visibility
                        handleKeyboardVisibility(true, imeInsets.bottom);
                        if (bridge.getConfig().isInputCaptured()) {
                            // Don't apply bottom margin to prevent scroll space
                            mlp.bottomMargin = 0;
                            // Adjust WebView height to account for keyboard
                            setPadding(getPaddingLeft(), getPaddingTop(), getPaddingRight(), imeInsets.bottom);
                        } else {
                            mlp.bottomMargin = Math.max(systemInsets.bottom, imeInsets.bottom);
                        }
                    } else {
                        // Keyboard hidden - restore normal margins
                        handleKeyboardVisibility(false, 0);
                        mlp.bottomMargin = systemInsets.bottom;
                        setPadding(getPaddingLeft(), getPaddingTop(), getPaddingRight(), 0);
                    }
                    
                    v.setLayoutParams(mlp);
                } else {
                    // Legacy handling for older Android versions (< 15)
                    MarginLayoutParams mlp = (MarginLayoutParams) v.getLayoutParams();
                    mlp.leftMargin = systemInsets.left;
                    mlp.rightMargin = systemInsets.right;
                    mlp.topMargin = systemInsets.top;
                    
                    // Fix viewport calculations for Android < 15
                    int navBarHeight = getNavigationBarHeight();
                    correctViewportForLegacyAndroid(navBarHeight, imeInsets.bottom);
                    
                    if (bridge.getConfig().isInputCaptured() && imeInsets.bottom > 0) {
                        mlp.bottomMargin = 0;
                    } else {
                        mlp.bottomMargin = systemInsets.bottom;
                    }
                    
                    v.setLayoutParams(mlp);
                }

                // Return appropriate insets based on Android version
                if (Build.VERSION.SDK_INT >= 34 && imeInsets.bottom > 0) {
                    // On Android 15+, let the system handle IME insets
                    return windowInsets.inset(systemInsets);
                }
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }
}
