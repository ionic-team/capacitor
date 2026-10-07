package com.getcapacitor.plugin;

import android.content.Context;
import android.graphics.Rect;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import androidx.annotation.NonNull;
import androidx.core.util.Consumer;
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter;
import androidx.window.layout.DisplayFeature;
import androidx.window.layout.FoldingFeature;
import androidx.window.layout.WindowInfoTracker;
import androidx.window.layout.WindowLayoutInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@CapacitorPlugin
public class Foldable extends Plugin {

    private static final String FLAT = "flat";
    private static final String HALF_OPENED = "half-opened";

    private final Executor executor = Executors.newSingleThreadExecutor();
    private WindowInfoTrackerCallbackAdapter windowInfoTracker;
    private Consumer<WindowLayoutInfo> layoutConsumer;
    private WindowLayoutInfo layoutInfo;
    private Double angle;
    private SensorEventListener hingeListener;

    @Override
    public void load() {
        observeLayout();
        observeHinge();
    }

    @PluginMethod
    public void isFoldable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("foldable", foldingFeature() != null || angle != null);
        call.resolve(result);
    }

    @PluginMethod
    public void getFoldState(PluginCall call) {
        call.resolve(foldState());
    }

    @PluginMethod
    public void getHingeAngle(PluginCall call) {
        JSObject result = new JSObject();
        if (angle == null) {
            result.put("angle", null);
        } else {
            result.put("angle", angle.doubleValue());
        }
        call.resolve(result);
    }

    private JSObject foldState() {
        JSObject state = new JSObject();
        FoldingFeature fold = foldingFeature();

        boolean separating = fold != null && fold.isSeparating();
        state.put("state", separating ? HALF_OPENED : FLAT);
        state.put("isSeparating", separating);
        state.put("posture", FLAT);

        if (fold != null) {
            boolean vertical = fold.getOrientation() == FoldingFeature.Orientation.VERTICAL;
            if (separating) {
                state.put("posture", vertical ? "book" : "tabletop");
            }
            state.put("hingeOrientation", vertical ? "vertical" : "horizontal");

            Rect bounds = fold.getBounds();
            float density = getContext().getResources().getDisplayMetrics().density;
            JSObject rect = new JSObject();
            rect.put("x", bounds.left / density);
            rect.put("y", bounds.top / density);
            rect.put("width", bounds.width() / density);
            rect.put("height", bounds.height() / density);
            state.put("hingeBounds", rect);
        }

        return state;
    }

    private FoldingFeature foldingFeature() {
        if (layoutInfo == null) {
            return null;
        }
        for (DisplayFeature feature : layoutInfo.getDisplayFeatures()) {
            if (feature instanceof FoldingFeature) {
                return (FoldingFeature) feature;
            }
        }
        return null;
    }

    private void observeLayout() {
        windowInfoTracker = new WindowInfoTrackerCallbackAdapter(WindowInfoTracker.Companion.getOrCreate(getActivity()));
        layoutConsumer = info -> {
            layoutInfo = info;
            notifyListeners("foldStateChange", foldState());
        };
        windowInfoTracker.addWindowLayoutInfoListener(getActivity(), executor, layoutConsumer);
    }

    private void observeHinge() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return;
        }
        SensorManager sensors = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensors == null) {
            return;
        }
        Sensor hinge = sensors.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE);
        if (hinge == null) {
            return;
        }

        hingeListener = new SensorEventListener() {
            @Override
            public void onSensorChanged(@NonNull SensorEvent event) {
                angle = (double) event.values[0];
                JSObject result = new JSObject();
                result.put("angle", angle.doubleValue());
                notifyListeners("hingeAngleChange", result);
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {}
        };
        sensors.registerListener(hingeListener, hinge, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @Override
    protected void handleOnDestroy() {
        if (windowInfoTracker != null && layoutConsumer != null) {
            windowInfoTracker.removeWindowLayoutInfoListener(layoutConsumer);
            layoutConsumer = null;
        }
        if (hingeListener != null) {
            SensorManager sensors = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
            if (sensors != null) {
                sensors.unregisterListener(hingeListener);
            }
            hingeListener = null;
        }
    }
}
