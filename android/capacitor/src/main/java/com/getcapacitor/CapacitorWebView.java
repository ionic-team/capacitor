package com.getcapacitor;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.view.KeyEvent;
import android.view.inputmethod.BaseInputConnection;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebView;

import java.util.Date;

public class CapacitorWebView extends WebView {
  private BaseInputConnection capInputConnection;

  public CapacitorWebView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
    boolean captureInput = Config.getBoolean("android.captureInput", false);
    if (captureInput) {
      if (capInputConnection == null) {
        capInputConnection = new BaseInputConnection(this, false);
      }
      return capInputConnection;
    }
    return super.onCreateInputConnection(outAttrs);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent event) {
    if (event.getAction() == KeyEvent.ACTION_MULTIPLE) {
      evaluateJavascript("document.activeElement.value = document.activeElement.value + '" + event.getCharacters() + "';", null);
      return false;
    }
    return super.dispatchKeyEvent(event);
  }
}
