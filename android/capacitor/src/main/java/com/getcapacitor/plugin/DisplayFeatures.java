package com.getcapacitor.plugin;

import android.graphics.Rect;
import android.view.View;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
// WindowInfoTrackerCallbackAdapter's listener methods take AndroidX's own Consumer, not
// java.util.function.Consumer - confirmed by a real compile error, not a guess.
import androidx.core.util.Consumer;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.window.java.layout.WindowInfoTrackerCallbackAdapter;
import androidx.window.layout.DisplayFeature;
import androidx.window.layout.FoldingFeature;
import androidx.window.layout.WindowInfoTracker;
import androidx.window.layout.WindowLayoutInfo;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.Executor;

/**
 * Android counterpart of the iOS DisplayFeatures plugin (see
 * ios/Capacitor/Capacitor/Plugins/DisplayFeatures.swift and core/display-features.md).
 *
 * Unlike the iOS plugin - which depends on an iOS 27.1 SDK Apple has not
 * released publicly as of 2026-09-10 - this is backed by
 * {@code androidx.window}'s {@link FoldingFeature} API, stable since 2021 and
 * used in production by real foldables (Samsung Galaxy Z Fold, and, while it
 * shipped, the Microsoft Surface Duo).
 *
 * The DisplayFeaturesState shape was designed around iPhone Duo's two-named-
 * displays model, so several of its fields have no real Android analogue.
 * Rather than guess at a value, this always reports their neutral "not
 * applicable to this platform" value - see the field-by-field notes in
 * {@link #toJSObject(WindowLayoutInfo)}.
 */
@CapacitorPlugin
public class DisplayFeatures extends Plugin {

    private WindowInfoTrackerCallbackAdapter tracker;
    private Consumer<WindowLayoutInfo> changeListener;
    private JSObject lastSnapshot;

    @Override
    public void load() {
        tracker = new WindowInfoTrackerCallbackAdapter(WindowInfoTracker.getOrCreate(getActivity()));
    }

    @Override
    protected void handleOnStart() {
        super.handleOnStart();
        startObserving();
    }

    @Override
    protected void handleOnStop() {
        super.handleOnStop();
        stopObserving();
    }

    @PluginMethod
    public void getDisplayFeatures(final PluginCall call) {
        // WindowInfoTracker is stream-based (backed by a Kotlin Flow); there's no synchronous
        // "give me the current value" method even via the Java callback adapter. Registering a
        // one-shot listener and resolving on its first callback is correct regardless of whether
        // the persistent listener from startObserving() has already delivered a value - this
        // never races with plugin/webview startup ordering.
        Executor mainExecutor = ContextCompat.getMainExecutor(getContext());
        final Consumer<WindowLayoutInfo>[] oneShot = new Consumer[1];
        oneShot[0] = windowLayoutInfo -> {
            call.resolve(toJSObject(windowLayoutInfo));
            tracker.removeWindowLayoutInfoListener(oneShot[0]);
        };
        tracker.addWindowLayoutInfoListener(getActivity(), mainExecutor, oneShot[0]);
    }

    private void startObserving() {
        if (changeListener != null) {
            return;
        }
        Executor mainExecutor = ContextCompat.getMainExecutor(getContext());
        changeListener = this::notifyIfChanged;
        tracker.addWindowLayoutInfoListener(getActivity(), mainExecutor, changeListener);
    }

    private void stopObserving() {
        if (changeListener == null) {
            return;
        }
        tracker.removeWindowLayoutInfoListener(changeListener);
        changeListener = null;
    }

    private void notifyIfChanged(WindowLayoutInfo windowLayoutInfo) {
        JSObject current = toJSObject(windowLayoutInfo);
        if (lastSnapshot != null && lastSnapshot.toString().equals(current.toString())) {
            return;
        }
        lastSnapshot = current;
        notifyListeners("displayFeaturesChanged", current);
    }

    // MARK: - Mapping

    private JSObject toJSObject(WindowLayoutInfo windowLayoutInfo) {
        JSObject result = new JSObject();

        // androidx.window is always present once this dependency is added - a non-foldable
        // device correctly reports "no folding feature" via an empty list, which isn't an
        // unsupported case the way iOS's pre-27.1-SDK state is.
        result.put("supported", true);

        JSArray reservedRegions = new JSArray();
        FoldingFeature.State separatingFoldState = null;
        boolean sawAnyFoldingFeature = false;

        for (DisplayFeature feature : windowLayoutInfo.getDisplayFeatures()) {
            if (!(feature instanceof FoldingFeature)) {
                continue;
            }
            sawAnyFoldingFeature = true;
            FoldingFeature foldingFeature = (FoldingFeature) feature;
            // Only a separating fold corresponds to the HIG's "reserved region" concept - a
            // non-separating fold (e.g. some tabletop postures) isn't meant to divide content,
            // so it isn't reported as a region to avoid.
            if (foldingFeature.isSeparating()) {
                reservedRegions.put(toReservedRegion(foldingFeature));
                separatingFoldState = foldingFeature.getState();
            }
        }

        String pose;
        if (separatingFoldState != null) {
            pose = FoldingFeature.State.HALF_OPENED.equals(separatingFoldState) ? "partiallyOpen" : "open";
        } else if (sawAnyFoldingFeature) {
            // A folding feature is present but not currently separating content: flat, nothing
            // to divide.
            pose = "open";
        } else {
            // No folding feature at all. This could mean a non-foldable device, or a foldable
            // that's fully open with nothing to report - WindowLayoutInfo can't tell these
            // apart, so this reports 'unknown' rather than guessing 'open'.
            pose = "unknown";
        }
        result.put("pose", pose);

        // iPhone Duo's inner/outer-display model has no Android analogue exposed by
        // WindowManager for a single Activity's window.
        result.put("activeDisplay", "unknown");

        // Size classes are a UIKit trait-collection concept. Android has an analogous but
        // differently-shaped system (androidx.window.core.layout.WindowSizeClass: three tiers,
        // width and height reported separately) that's deliberately out of scope here to keep
        // this change focused on fold detection rather than general responsive layout.
        result.put("horizontalSizeClass", "unspecified");
        result.put("verticalSizeClass", "unspecified");

        result.put("reservedRegions", reservedRegions);
        result.put("safeAreaInsets", safeAreaInsetsJSObject());
        result.put("bounds", windowBoundsJSObject());
        return result;
    }

    private JSObject toReservedRegion(FoldingFeature feature) {
        JSObject region = new JSObject();
        // Android's only concept mapping onto the HIG's "reserved regions" is the fold/hinge
        // itself - there's no separate camera-cutout entry here because display cutouts are
        // already handled by SystemBars' safe-area insets, not this "avoid this region" model.
        region.put("type", "fold");
        region.put("rect", rectToJSObject(feature.getBounds()));
        return region;
    }

    private JSObject rectToJSObject(Rect rect) {
        // FoldingFeature.getBounds() is in raw pixels, in the window's coordinate space.
        // Converting by density to dp matches the iOS field's documented unit (CSS px in the web
        // view's coordinate space) and mirrors how SystemBars already converts inset pixels to
        // dp before injecting them as CSS custom properties.
        //
        // Uses the public fields directly (rect.right - rect.left) rather than Rect.width()/
        // height(): those methods hit android.jar's unit-test stub jar ("Method width in
        // android.graphics.Rect not mocked") when called on a Rect produced by test code, found
        // by actually running DisplayFeaturesTest against the real Android Gradle plugin. Field
        // access sidesteps that and is equally correct.
        float density = getContext().getResources().getDisplayMetrics().density;
        JSObject json = new JSObject();
        json.put("x", rect.left / density);
        json.put("y", rect.top / density);
        json.put("width", (rect.right - rect.left) / density);
        json.put("height", (rect.bottom - rect.top) / density);
        return json;
    }

    private JSObject safeAreaInsetsJSObject() {
        View rootView = getBridge().getWebView();
        WindowInsetsCompat windowInsets = rootView != null ? ViewCompat.getRootWindowInsets(rootView) : null;
        Insets safeArea = windowInsets != null
            ? windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout())
            : Insets.NONE;
        float density = getContext().getResources().getDisplayMetrics().density;

        JSObject insets = new JSObject();
        insets.put("top", safeArea.top / density);
        insets.put("left", safeArea.left / density);
        insets.put("bottom", safeArea.bottom / density);
        insets.put("right", safeArea.right / density);
        return insets;
    }

    private JSObject windowBoundsJSObject() {
        View rootView = getBridge().getWebView();
        float density = getContext().getResources().getDisplayMetrics().density;

        JSObject bounds = new JSObject();
        bounds.put("width", rootView != null ? rootView.getWidth() / density : 0);
        bounds.put("height", rootView != null ? rootView.getHeight() / density : 0);
        return bounds;
    }
}
