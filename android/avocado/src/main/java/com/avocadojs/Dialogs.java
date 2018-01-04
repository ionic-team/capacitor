package com.avocadojs;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Handler;
import android.os.Looper;

/**
 * Simple utility for showing common web dialogs
 */
public class Dialogs {
  public interface OnResultListener {
    void onResult(boolean value, boolean didCancel, String inputValue);
  }

  /**
   * Show a simple alert with a message and default values for
   * title and ok button
   * @param message the message to show
   */
  public static void alert(final Context context, final String message, final Dialogs.OnResultListener listener) {
    alert(context, message, null, null, listener);
  }

  /**
   * Show an alert window
   * @param context the context
   * @param message the message for the alert
   * @param title the title for the alert
   * @param okButtonTitle the title for the OK button
   * @param listener the listener for returning data back
   */
  public static void alert(final Context context,
                           final String message,
                           final String title,
                           final String okButtonTitle,
                           final Dialogs.OnResultListener listener) {

    final String alertTitle = title == null ? "Alert" : title;
    final String alertOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;

    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);

        builder
            .setMessage(message)
            // TODO: i18n
            .setTitle(alertTitle)
            .setPositiveButton(alertOkButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                listener.onResult(true, false, null);
              }
            })
            .setOnCancelListener(new AlertDialog.OnCancelListener() {
              public void onCancel(DialogInterface dialog) {
                dialog.dismiss();
                listener.onResult(false, true, null);
              }
            });

        AlertDialog dialog = builder.create();

        dialog.show();
      }
    });

  }
}
