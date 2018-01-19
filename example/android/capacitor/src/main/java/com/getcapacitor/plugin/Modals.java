package com.getcapacitor.plugin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
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

  @PluginMethod()
  public void showSharing(final PluginCall call) {
    String title = call.getString("title", "Share");
    String message = call.getString("message");
    String url = call.getString("url");
    String subject = call.getString("subject", "");

    if (message == null && url == null) {
      call.error("Must provide a URL or Message");
      return;
    }

    // If they supplied both fields, concat em
    if (message != null && url != null) {
      message = message + " " + url;
    } else if(url != null) {
      message = url;
    }

    Intent intent = new Intent(Intent.ACTION_SEND);
    intent.setTypeAndNormalize("text/plain");

    intent.putExtra(Intent.EXTRA_TEXT, message);

    if (subject != null) {
      intent.putExtra(Intent.EXTRA_SUBJECT, subject);
    }

    Intent chooser = Intent.createChooser(intent, title);
    chooser.addCategory(Intent.CATEGORY_DEFAULT);

    getActivity().startActivity(chooser);
  }


  public static class ModalsBottomSheetDialogFragment extends BottomSheetDialogFragment {
    interface OnSelectedListener {
      void onSelected(int index);
    }

    private JSArray options;

    private OnSelectedListener listener;

    public void setOptions(JSArray options) {
      this.options = options;
    }

    public void setOnSelectedListener(OnSelectedListener listener) {
      this.listener = listener;
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

      if (options == null) {
        return;
      }

      Window w = dialog.getWindow();

      final float scale = getResources().getDisplayMetrics().density;

      float layoutPaddingDp16 = 16.0f;
      float layoutPaddingDp12  = 12.0f;
      float layoutPaddingDp8  = 8.0f;
      int layoutPaddingPx16 = (int) (layoutPaddingDp16 * scale + 0.5f);
      int layoutPaddingPx12 = (int) (layoutPaddingDp12 * scale + 0.5f);
      int layoutPaddingPx8 = (int) (layoutPaddingDp8 * scale + 0.5f);

      CoordinatorLayout parentLayout = new CoordinatorLayout(getContext());

      LinearLayout layout = new LinearLayout(getContext());
      layout.setOrientation(LinearLayout.VERTICAL);
      layout.setPadding(layoutPaddingPx16, layoutPaddingPx16, layoutPaddingPx16, layoutPaddingPx16);

      try {
        List<Object> optionsList = options.toList();
        for (int i = 0; i < optionsList.size(); i++) {
          final int optionIndex = i;
          JSObject o = JSObject.fromJSONObject((JSONObject) optionsList.get(i));
          String styleOption = o.getString("style", "DEFAULT");
          String titleOption = o.getString("title", "");

          TextView tv = new TextView(getContext());
          tv.setTextColor(Color.parseColor("#000000"));
          tv.setPadding(layoutPaddingPx12, layoutPaddingPx12, layoutPaddingPx12, layoutPaddingPx12);
          //tv.setBackgroundColor(Color.parseColor("#80000000"));
          tv.setText(titleOption);
          tv.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
              Log.d(Bridge.TAG, "CliCKED: " + optionIndex);

              if (listener != null) {
                listener.onSelected(optionIndex);
              }
            }
          });
          layout.addView(tv);
        }

        parentLayout.addView(layout.getRootView());

        dialog.setContentView(parentLayout.getRootView());

        //dialog.getWindow().getDecorView().setBackgroundColor(Color.parseColor("#000000"));

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
