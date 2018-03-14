package com.getcapacitor.plugin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.graphics.Color;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomSheetBehavior;
import android.support.design.widget.BottomSheetDialogFragment;
import android.support.design.widget.CoordinatorLayout;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.getcapacitor.Bridge;
import com.getcapacitor.Dialogs;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.ui.ModalsBottomSheetDialogFragment;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

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

    if(title == null || message == null) {
      call.error("Please provide a title or message for the alert");
      return;
    }

    if (c.isFinishing()) {
      call.error("App is finishing");
      return;
    }

    Dialogs.prompt(c, message, title, okButtonTitle, cancelButtonTitle, inputPlaceholder, new Dialogs.OnResultListener() {
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
    fragment.setOptions(options);
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
