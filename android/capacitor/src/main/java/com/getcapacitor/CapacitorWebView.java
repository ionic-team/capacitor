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
  public CapacitorWebView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public InputConnection onCreateInputConnection(EditorInfo outAttrs) {
    return new BaseInputConnection(this, false);
  }

  @Override
  public boolean dispatchKeyEvent(KeyEvent event) {
    return super.dispatchKeyEvent(event);
  }
}
