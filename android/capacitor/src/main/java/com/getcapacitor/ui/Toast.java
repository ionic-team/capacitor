package com.getcapacitor.ui;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

/**
 * Toast utility. "Yeah toast" echos softly in the distance.
 */
public class Toast {

  public static void show(Context c, String text) {
    show(c, text, android.widget.Toast.LENGTH_LONG);
  }

  public static void show(final Context c, final String text, final int duration) {
    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        android.widget.Toast toast = android.widget.Toast.makeText(c, text, duration);
        toast.show();
      }
    });
  }
}
