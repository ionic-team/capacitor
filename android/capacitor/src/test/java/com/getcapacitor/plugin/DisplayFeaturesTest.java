package com.getcapacitor.plugin;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Rect;
import android.util.DisplayMetrics;
import android.webkit.WebView;
import androidx.core.view.ViewCompat;
import androidx.window.layout.DisplayFeature;
import androidx.window.layout.FoldingFeature;
import androidx.window.layout.WindowLayoutInfo;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.List;
import org.json.JSONArray;
import org.junit.Test;
import org.mockito.MockedStatic;

/**
 * Unit tests for DisplayFeatures' pure mapping logic (toJSObject). Uses the
 * same reflection-into-a-private-method + mocked Bridge pattern as
 * SystemBarsTest; no Robolectric or instrumentation needed.
 */
public class DisplayFeaturesTest {

    @Test
    public void reportsUnknownPoseAndNoRegionsWhenNoFoldingFeaturePresent() throws Exception {
        JSObject result = invokeToJSObject(Collections.emptyList());

        assertTrue(result.getBoolean("supported"));
        assertEquals("unknown", result.getString("pose"));
        assertEquals("unknown", result.getString("activeDisplay"));
        assertEquals(0, result.getJSONArray("reservedRegions").length());
    }

    @Test
    public void reportsPartiallyOpenAndAReservedRegionForASeparatingHalfOpenedFold() throws Exception {
        FoldingFeature fold = mockFoldingFeature(FoldingFeature.State.HALF_OPENED, true, rect(0, 410, 820, 434));

        JSObject result = invokeToJSObject(Collections.singletonList(fold));

        assertEquals("partiallyOpen", result.getString("pose"));
        JSONArray regions = result.getJSONArray("reservedRegions");
        assertEquals(1, regions.length());
        JSObject region = (JSObject) regions.get(0);
        assertEquals("fold", region.getString("type"));
        JSObject rect = region.getJSObject("rect");
        // density is stubbed to 2.0 in the test fixture; 820px / 2.0 = 410.0dp, etc.
        assertEquals(0.0, rect.getDouble("x"), 0.001);
        assertEquals(205.0, rect.getDouble("y"), 0.001);
        assertEquals(410.0, rect.getDouble("width"), 0.001);
        assertEquals(12.0, rect.getDouble("height"), 0.001);
    }

    @Test
    public void reportsOpenForASeparatingFlatFold() throws Exception {
        FoldingFeature fold = mockFoldingFeature(FoldingFeature.State.FLAT, true, rect(0, 0, 10, 10));

        JSObject result = invokeToJSObject(Collections.singletonList(fold));

        assertEquals("open", result.getString("pose"));
        assertEquals(1, result.getJSONArray("reservedRegions").length());
    }

    @Test
    public void nonSeparatingFoldReportsOpenButNoReservedRegion() throws Exception {
        FoldingFeature fold = mockFoldingFeature(FoldingFeature.State.HALF_OPENED, false, rect(0, 0, 10, 10));

        JSObject result = invokeToJSObject(Collections.singletonList(fold));

        assertEquals("open", result.getString("pose"));
        assertEquals(0, result.getJSONArray("reservedRegions").length());
    }

    @Test
    public void alwaysReportsUnspecifiedSizeClassesRegardlessOfFoldState() throws Exception {
        JSObject noFold = invokeToJSObject(Collections.emptyList());
        JSObject folded = invokeToJSObject(
            Collections.singletonList(mockFoldingFeature(FoldingFeature.State.HALF_OPENED, true, rect(0, 0, 10, 10)))
        );

        for (JSObject result : new JSObject[] { noFold, folded }) {
            assertEquals("unspecified", result.getString("horizontalSizeClass"));
            assertEquals("unspecified", result.getString("verticalSizeClass"));
        }
    }

    // MARK: - Fixture

    private FoldingFeature mockFoldingFeature(FoldingFeature.State state, boolean isSeparating, Rect bounds) {
        FoldingFeature fold = mock(FoldingFeature.class);
        when(fold.getState()).thenReturn(state);
        when(fold.isSeparating()).thenReturn(isSeparating);
        when(fold.getBounds()).thenReturn(bounds);
        return fold;
    }

    /**
     * Android's unit-test stub android.jar (at least for SDK 36, as run here) doesn't preserve
     * fields set via Rect's 4-arg constructor - reading them back after `new Rect(0, 410, 820,
     * 434)` returned 0 for every field but `left`, found by actually running this test. Public
     * field assignment isn't a method call, so it isn't affected the same way; use this instead
     * of the constructor anywhere a test needs a non-zero Rect.
     */
    private Rect rect(int left, int top, int right, int bottom) {
        Rect rect = new Rect();
        rect.left = left;
        rect.top = top;
        rect.right = right;
        rect.bottom = bottom;
        return rect;
    }

    private JSObject invokeToJSObject(List<DisplayFeature> displayFeatures) throws Exception {
        DisplayFeatures plugin = new DisplayFeatures();

        Bridge bridge = mock(Bridge.class);
        Context context = mock(Context.class);
        Resources resources = mock(Resources.class);
        DisplayMetrics metrics = new DisplayMetrics();
        metrics.density = 2.0f;
        WebView webView = mock(WebView.class);

        when(bridge.getContext()).thenReturn(context);
        when(bridge.getWebView()).thenReturn(webView);
        when(context.getResources()).thenReturn(resources);
        when(resources.getDisplayMetrics()).thenReturn(metrics);
        when(webView.getWidth()).thenReturn(820);
        when(webView.getHeight()).thenReturn(1180);

        plugin.setBridge(bridge);

        WindowLayoutInfo windowLayoutInfo = mock(WindowLayoutInfo.class);
        when(windowLayoutInfo.getDisplayFeatures()).thenReturn(displayFeatures);

        try (MockedStatic<ViewCompat> viewCompat = mockStatic(ViewCompat.class)) {
            // No insets available in this fixture; toJSObject/safeAreaInsetsJSObject already
            // handles a null WindowInsetsCompat by falling back to Insets.NONE.
            viewCompat.when(() -> ViewCompat.getRootWindowInsets(webView)).thenReturn(null);

            Method toJSObject = DisplayFeatures.class.getDeclaredMethod("toJSObject", WindowLayoutInfo.class);
            toJSObject.setAccessible(true);
            return (JSObject) toJSObject.invoke(plugin, windowLayoutInfo);
        }
    }
}
