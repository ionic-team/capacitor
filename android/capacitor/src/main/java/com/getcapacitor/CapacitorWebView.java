package com.getcapacitor;

import android.content.Context;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.view.inputmethod.BaseInputConnection;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class CapacitorWebView extends WebView {

    private BaseInputConnection capInputConnection;
    private Bridge bridge;
    private boolean autosuggestionEnabled = true;

    public CapacitorWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
        edgeToEdgeHandler();
    }

    public void setBridge(Bridge bridge) {
        this.bridge = bridge;
    }

    public void setAutosuggestionEnabled(boolean enabled) {
        autosuggestionEnabled = enabled;
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
        InputConnection inputConnection;
        if (captureInput) {
            if (capInputConnection == null) {
                capInputConnection = new BaseInputConnection(this, false);
            }
            inputConnection = capInputConnection;
        } else {
            inputConnection = super.onCreateInputConnection(outAttrs);
        }

        if (!autosuggestionEnabled) {
            // See https://stackoverflow.com/a/28009054/640584
            outAttrs.inputType &= ~EditorInfo.TYPE_MASK_VARIATION;
            outAttrs.inputType |= InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD;
        }

        return inputConnection;
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

    private void edgeToEdgeHandler() {
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
