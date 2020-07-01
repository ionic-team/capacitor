package com.getcapacitor.plugin;

import android.app.Activity;

import com.getcapacitor.Dialogs;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.ui.ModalsBottomSheetDialogFragment;

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

    if (c.isFinishing()) {
      call.error("App is finishing");
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

    if (c.isFinishing()) {
      call.error("App is finishing");
      return;
    }

    Dialogs.confirm(c, message, title, okButtonTitle, cancelButtonTitle, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.success(ret);
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
    final String inputText = call.getString("inputText", "");

    if(title == null || message == null) {
      call.error("Please provide a title or message for the alert");
      return;
    }

    if (c.isFinishing()) {
      call.error("App is finishing");
      return;
    }

    Dialogs.prompt(c, message, title, okButtonTitle, cancelButtonTitle, inputPlaceholder, inputText, new Dialogs.OnResultListener() {
      @Override
      public void onResult(boolean value, boolean didCancel, String inputValue) {
        JSObject ret = new JSObject();
        ret.put("cancelled", didCancel);
        ret.put("value", inputValue == null ? "" : inputValue);
        call.success(ret);
      }
    });
  }


  @PluginMethod()
  public void showActions(final PluginCall call) {
    String title = call.getString("title");
    String message = call.getString("message", "");
    JSArray options = call.getArray("options");

    if (title == null) {
      call.error("Must supply a title");
      return;
    }

    if (options == null) {
      call.error("Must supply options");
      return;
    }

    if (getActivity().isFinishing()) {
      call.error("App is finishing");
      return;
    }

    final ModalsBottomSheetDialogFragment fragment = new ModalsBottomSheetDialogFragment();
    fragment.setTitle(title);
    fragment.setOptions(options);
    fragment.setCancelable(false);
    fragment.setOnSelectedListener(new ModalsBottomSheetDialogFragment.OnSelectedListener() {
      @Override
      public void onSelected(int index) {
        JSObject ret = new JSObject();
        ret.put("index", index);
        call.success(ret);
        fragment.dismiss();
      }
    });
    fragment.show(getActivity().getSupportFragmentManager(), "capacitorModalsActionSheet");
  }

}
