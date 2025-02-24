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
import java.util.Objects;

public class CapacitorWebView extends WebView {

    private BaseInputConnection capInputConnection;
    private Bridge bridge;

    public CapacitorWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void setBridge(Bridge bridge) {
        this.bridge = bridge;
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

        boolean autoMargins = false;
        boolean forceMargins = Objects.equals(configEdgeToEdge, "force");
        boolean disableMargins = Objects.equals(configEdgeToEdge, "disable");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            boolean foundOptOut = false;
            boolean optOutValue = false;

            TypedValue value = new TypedValue();
            foundOptOut = getContext().getTheme().resolveAttribute(android.R.attr.windowOptOutEdgeToEdgeEnforcement, value, true);
            optOutValue = value.data != 0; // value is set to -1 on true as of Android 15, so we have to do this.

            autoMargins = Objects.equals(configEdgeToEdge, "auto") && !(foundOptOut && optOutValue);
        }

        if (forceMargins || (autoMargins && !disableMargins)) {
            ViewCompat.setOnApplyWindowInsetsListener(this, (v, windowInsets) -> {
                Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
                MarginLayoutParams mlp = (MarginLayoutParams) v.getLayoutParams();
                mlp.leftMargin = insets.left;
                mlp.bottomMargin = insets.bottom;
                mlp.rightMargin = insets.right;
                mlp.topMargin = insets.top;
                v.setLayoutParams(mlp);

                // Don't pass window insets to children
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }
}
