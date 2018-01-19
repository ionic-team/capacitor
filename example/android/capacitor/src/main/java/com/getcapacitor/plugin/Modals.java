package com.getcapacitor.plugin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomSheetBehavior;
import android.support.design.widget.BottomSheetDialogFragment;
import android.support.design.widget.CoordinatorLayout;
import android.util.Log;
import android.view.View;
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

import org.json.JSONException;
import org.json.JSONObject;

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

    ModalsBottomSheetDialogFragment fragment = new ModalsBottomSheetDialogFragment();
    fragment.setOptions(options);
    fragment.show(getActivity().getSupportFragmentManager(), "capacitorModalsActionSheet");
  }

  @PluginMethod()
  public void showSharing(final PluginCall call) {

  }


  public static class ModalsBottomSheetDialogFragment extends BottomSheetDialogFragment {
    private JSArray options;

    public void setOptions(JSArray options) {
      this.options = options;
    }

    private BottomSheetBehavior.BottomSheetCallback mBottomSheetBehaviorCallback = new BottomSheetBehavior.BottomSheetCallback() {

     @Override
      public void onStateChanged(@NonNull View bottomSheet, int newState) {
        if (newState == BottomSheetBehavior.STATE_HIDDEN) {
          dismiss();
        }

      }

      @Override
      public void onSlide(@NonNull View bottomSheet, float slideOffset) {
      }
    };

    @Override
    @SuppressLint("RestrictedApi")
    public void setupDialog(Dialog dialog, int style) {
      super.setupDialog(dialog, style);

      CoordinatorLayout parentLayout = new CoordinatorLayout(getContext());

      LinearLayout layout = new LinearLayout(getContext());

      try {
        for (Object obj : options.toList()) {
          JSObject o = JSObject.fromJSONObject((JSONObject) obj);
          String styleOption = o.getString("style", "DEFAULT");
          String titleOption = o.getString("title", "");

          TextView tv = new TextView(getContext());
          tv.setText(titleOption);
          layout.addView(tv);
        }

        parentLayout.addView(layout.getRootView());

        dialog.setContentView(parentLayout.getRootView());

        CoordinatorLayout.LayoutParams params = (CoordinatorLayout.LayoutParams) ((View) parentLayout.getParent()).getLayoutParams();
        CoordinatorLayout.Behavior behavior = params.getBehavior();

        if (behavior != null && behavior instanceof BottomSheetBehavior) {
          ((BottomSheetBehavior) behavior).setBottomSheetCallback(mBottomSheetBehaviorCallback);
        }
      } catch (JSONException ex) {
        Log.e(Bridge.TAG, "JSON error processing an option for showActions", ex);
      }
    }
  }
}
