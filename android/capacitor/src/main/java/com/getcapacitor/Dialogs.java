package com.getcapacitor;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.widget.EditText;

import com.getcapacitor.ui.ModalsBottomSheetDialogFragment;

import org.json.JSONException;

/**
 * Simple utility for showing common web dialogs
 */
public class Dialogs {
  public interface OnResultListener {
    void onResult(boolean value, boolean didCancel, String inputValue);
  }

  public interface OnSelectListener {
    void onSelect(int index);
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

  public static void confirm(final Context context,
                             final String message,
                             final Dialogs.OnResultListener listener) {
    confirm(context, message, null, null, null, listener);
  }

  public static void confirm(final Context context,
                             final String message,
                             final String title,
                             final String okButtonTitle,
                             final String cancelButtonTitle,
                             final Dialogs.OnResultListener listener) {
    final String confirmTitle = title == null ? "Confirm" : title;
    final String confirmOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;
    final String confirmCancelButtonTitle = cancelButtonTitle == null ? "Cancel" : cancelButtonTitle;

    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);

        builder
            .setMessage(message)
            .setTitle(confirmTitle)
            .setPositiveButton(confirmOkButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                listener.onResult(true, false, null);
              }
            })
            .setNegativeButton(confirmCancelButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                listener.onResult(false, false, null);
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

  public static void prompt(final Context context,
                            final String message,
                            final Dialogs.OnResultListener listener) {

    prompt(context, message, null, null, null, null, listener);
  }

  public static void prompt(final Context context,
                            final String message,
                            final String title,
                            final String okButtonTitle,
                            final String cancelButtonTitle,
                            final String inputPlaceholder,
                            final Dialogs.OnResultListener listener) {
    final String promptTitle = title == null ? "Prompt" : title;
    final String promptOkButtonTitle = okButtonTitle == null ? "OK" : okButtonTitle;
    final String promptCancelButtonTitle = cancelButtonTitle == null ? "Cancel" : cancelButtonTitle;
    final String promptInputPlaceholder = inputPlaceholder == null ? "" : inputPlaceholder;

    new Handler(Looper.getMainLooper()).post(new Runnable() {
      @Override
      public void run() {
        final AlertDialog.Builder builder = new AlertDialog.Builder(context);
        final EditText input = new EditText(context);

        input.setText(promptInputPlaceholder);

        builder
            .setMessage(message)
            .setTitle(promptTitle)
            .setView(input)
            .setPositiveButton(promptOkButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();

                String inputText = input.getText().toString().trim();
                listener.onResult(true, false, inputText);
              }
            })
            .setNegativeButton(promptCancelButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                listener.onResult(false, true, null);
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

  public static void actions(final AppCompatActivity activity,
                             final Object[] options,
                             final Dialogs.OnSelectListener listener) {

    JSArray optionsArray;
    try {
      optionsArray = new JSArray(options);
    } catch (JSONException ex) {
      return;
    }

    final ModalsBottomSheetDialogFragment fragment = new ModalsBottomSheetDialogFragment();
    fragment.setOptions(optionsArray);
    fragment.setOnSelectedListener(new ModalsBottomSheetDialogFragment.OnSelectedListener() {
      @Override
      public void onSelected(int index) {
        listener.onSelect(index);
        fragment.dismiss();
      }
    });
    fragment.show(activity.getSupportFragmentManager(), "capacitorModalsActionSheet");
  }
}
