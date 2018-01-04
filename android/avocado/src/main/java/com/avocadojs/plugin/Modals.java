package com.avocadojs.plugin;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.widget.EditText;

import com.avocadojs.Dialogs;
import com.avocadojs.JSObject;
import com.avocadojs.NativePlugin;
import com.avocadojs.Plugin;
import com.avocadojs.PluginCall;
import com.avocadojs.PluginMethod;

/**
 * Common popup modals
 */
@NativePlugin()
public class Modals extends Plugin {

  @PluginMethod()
  public void alert(final PluginCall call) {
    final Activity c = this.getActivity();
    final String title = call.getString("title");
    final String message = call.getString("message");
    final String buttonTitle = call.getString("buttonTitle", "OK");

    if(title == null || message == null) {
      call.error("Please provide a title or message for the alert");
      return;
    }

    Dialogs.alert(c, message, title, buttonTitle, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        call.success();
      }
    });
  }

  @PluginMethod()
  public void confirm(final PluginCall call) {
    final Activity c = this.getActivity();
    final String title = call.getString("title");
    final String message = call.getString("message");
    final String okButtonTitle = call.getString("okButtonTitle", "OK");
    final String cancelButtonTitle = call.getString("cancelButtonTitle", "Cancel");

    if(title == null || message == null) {
      call.error("Please provide a title or message for the alert");
      return;
    }

    getActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        final AlertDialog.Builder builder = new AlertDialog.Builder(c);

        builder
            .setMessage(message)
            .setTitle(title)
            .setPositiveButton(okButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                JSObject ret = new JSObject();
                ret.put("value", true);
                call.success(ret);
              }
            })
            .setNegativeButton(cancelButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                JSObject ret = new JSObject();
                ret.put("value", false);
                call.success(ret);
              }
            })

            .setOnCancelListener(new AlertDialog.OnCancelListener() {
              public void onCancel(DialogInterface dialog) {
                dialog.dismiss();
                JSObject ret = new JSObject();
                ret.put("value", false);
                call.success(ret);
              }
            });

        AlertDialog dialog = builder.create();

        dialog.show();
      }
    });
  }

  @PluginMethod()
  public void prompt(final PluginCall call) {
    final Activity c = this.getActivity();
    final String title = call.getString("title");
    final String message = call.getString("message");
    final String okButtonTitle = call.getString("okButtonTitle", "OK");
    final String cancelButtonTitle = call.getString("cancelButtonTitle", "Cancel");
    final String inputPlaceholder = call.getString("inputPlaceholder", "");

    if(title == null || message == null) {
      call.error("Please provide a title or message for the alert");
      return;
    }

    getActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        final AlertDialog.Builder builder = new AlertDialog.Builder(c);
        final EditText input = new EditText(c);

        input.setText(inputPlaceholder);

        builder
            .setMessage(message)
            .setTitle(title)
            .setView(input)
            .setPositiveButton(okButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();

                String inputText = input.getText().toString().trim();

                JSObject ret = new JSObject();
                ret.put("value", inputText);
                ret.put("cancelled", false);
                call.success(ret);
              }
            })
            .setNegativeButton(cancelButtonTitle, new AlertDialog.OnClickListener() {
              public void onClick(DialogInterface dialog, int buttonIndex) {
                dialog.dismiss();
                JSObject ret = new JSObject();
                ret.put("value", "");
                ret.put("cancelled", true);
                call.success(ret);
              }
            })
            .setOnCancelListener(new AlertDialog.OnCancelListener() {
              public void onCancel(DialogInterface dialog) {
                dialog.dismiss();
                JSObject ret = new JSObject();
                ret.put("value", "");
                ret.put("cancelled", true);
                call.success(ret);
              }
            });

        AlertDialog dialog = builder.create();

        dialog.show();
      }
    });
  }
}
