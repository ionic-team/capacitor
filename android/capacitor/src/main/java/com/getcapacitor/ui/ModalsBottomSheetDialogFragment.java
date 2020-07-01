package com.getcapacitor.ui;

import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.DialogInterface;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.coordinatorlayout.widget.CoordinatorLayout;

import com.getcapacitor.Dialogs;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

public class ModalsBottomSheetDialogFragment extends BottomSheetDialogFragment {
  public interface OnSelectedListener {
    void onSelected(int index);
  }

  @Override
  public void onCancel(DialogInterface dialog)
  {
    super.onCancel(dialog);
    this.cancelListener.onCancel();
  }

  private String title;
  private JSArray options;

  private OnSelectedListener listener;
  private Dialogs.OnCancelListener cancelListener;

  public void setTitle(String title) {
    this.title = title;
  }
  public void setOptions(JSArray options) {
    this.options = options;
  }

  public void setOnSelectedListener(OnSelectedListener listener) {
    this.listener = listener;
  }

  public void setOnCancelListener(Dialogs.OnCancelListener listener) {
    this.cancelListener = listener;
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
    TextView ttv = new TextView(getContext());
    ttv.setTextColor(Color.parseColor("#757575"));
    ttv.setPadding(layoutPaddingPx8, layoutPaddingPx8, layoutPaddingPx8, layoutPaddingPx8);
    ttv.setText(title);
    layout.addView(ttv);
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
            Logger.debug("CliCKED: " + optionIndex);

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
      Logger.error("JSON error processing an option for showActions", ex);
    }
  }
}
