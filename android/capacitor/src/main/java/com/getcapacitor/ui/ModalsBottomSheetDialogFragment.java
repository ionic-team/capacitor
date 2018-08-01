package com.getcapacitor.ui;

import android.annotation.SuppressLint;
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
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.LogUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class ModalsBottomSheetDialogFragment extends BottomSheetDialogFragment {
  public interface OnSelectedListener {
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
            Log.d(LogUtils.getCoreTag(), "CliCKED: " + optionIndex);

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
      Log.e(LogUtils.getCoreTag(), "JSON error processing an option for showActions", ex);
    }
  }
}
