package com.getcapacitor.plugin;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.util.TypedValue;
import android.view.View;
import android.view.Window;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import java.lang.reflect.Method;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;

public class SystemBarsTest {

    @Test
    public void showWithEmptyBarShowsSystemBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("");

        verify(controller).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.statusBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.navigationBars());
    }

    @Test
    public void showWithStatusBarShowsOnlyStatusBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("StatusBar");

        verify(controller).show(WindowInsetsCompat.Type.statusBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.navigationBars());
    }

    @Test
    public void showWithNavigationBarShowsOnlyNavigationBars() throws Exception {
        WindowInsetsControllerCompat controller = invokeSetHidden("NavigationBar");

        verify(controller).show(WindowInsetsCompat.Type.navigationBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.systemBars());
        verify(controller, never()).show(WindowInsetsCompat.Type.statusBars());
    }

    @Test
    public void getStyleReturnsDefaultAfterSettingDefault() throws Exception {
        try (StyleFixture fixture = new StyleFixture()) {
            fixture.setStyle("DEFAULT", "");

            verify(fixture.controller).setAppearanceLightStatusBars(true);
            assertEquals("DEFAULT", fixture.getStyle("StatusBar"));
            assertEquals("DEFAULT", fixture.getStyle("NavigationBar"));
        }
    }

    @Test
    public void getStyleReturnsStyleOfRequestedBar() throws Exception {
        try (StyleFixture fixture = new StyleFixture()) {
            fixture.setStyle("LIGHT", "");
            fixture.setStyle("DARK", "NavigationBar");

            assertEquals("LIGHT", fixture.getStyle("StatusBar"));
            assertEquals("DARK", fixture.getStyle("NavigationBar"));
        }
    }

    @Test
    public void getStyleDefaultsToStatusBar() throws Exception {
        try (StyleFixture fixture = new StyleFixture()) {
            fixture.setStyle("DARK", "StatusBar");

            assertEquals("DARK", fixture.getStyle(null));
        }
    }

    @Test
    public void configurationChangeReappliesDefaultStyleForNewTheme() throws Exception {
        try (StyleFixture fixture = new StyleFixture()) {
            fixture.setStyle("DEFAULT", "");
            verify(fixture.controller).setAppearanceLightStatusBars(true);
            verify(fixture.controller).setAppearanceLightNavigationBars(true);

            fixture.configuration.uiMode = Configuration.UI_MODE_NIGHT_YES;
            fixture.plugin.handleOnConfigurationChanged(fixture.configuration);

            verify(fixture.controller).setAppearanceLightStatusBars(false);
            verify(fixture.controller).setAppearanceLightNavigationBars(false);
        }
    }

    private static class StyleFixture implements AutoCloseable {

        final SystemBars plugin = new SystemBars();
        final Configuration configuration = mock(Configuration.class);
        final WindowInsetsControllerCompat controller = mock(WindowInsetsControllerCompat.class);
        private final MockedStatic<WindowCompat> windowCompat = mockStatic(WindowCompat.class);
        private final MockedConstruction<TypedValue> typedValues = mockConstruction(TypedValue.class);

        StyleFixture() {
            Bridge bridge = mock(Bridge.class);
            AppCompatActivity activity = mock(AppCompatActivity.class);
            Resources resources = mock(Resources.class);
            Context context = mock(Context.class);
            Window window = mock(Window.class);
            View decorView = mock(View.class);

            configuration.uiMode = Configuration.UI_MODE_NIGHT_NO;
            when(bridge.getActivity()).thenReturn(activity);
            when(bridge.getContext()).thenReturn(context);
            when(context.getTheme()).thenReturn(mock(Resources.Theme.class));
            when(activity.getResources()).thenReturn(resources);
            when(resources.getConfiguration()).thenReturn(configuration);
            when(activity.getWindow()).thenReturn(window);
            when(window.getDecorView()).thenReturn(decorView);
            doAnswer((invocation) -> {
                ((Runnable) invocation.getArgument(0)).run();
                return null;
            })
                .when(bridge)
                .executeOnMainThread(any(Runnable.class));
            windowCompat.when(() -> WindowCompat.getInsetsController(window, decorView)).thenReturn(controller);

            plugin.setBridge(bridge);
        }

        void setStyle(String style, String bar) throws Exception {
            Method setStyle = SystemBars.class.getDeclaredMethod("setStyle", String.class, String.class);
            setStyle.setAccessible(true);
            setStyle.invoke(plugin, style, bar);
        }

        String getStyle(String bar) {
            PluginCall call = mock(PluginCall.class);
            when(call.getString("bar", "StatusBar")).thenReturn(bar == null ? "StatusBar" : bar);

            plugin.getStyle(call);

            ArgumentCaptor<JSObject> result = ArgumentCaptor.forClass(JSObject.class);
            verify(call).resolve(result.capture());
            return result.getValue().getString("style");
        }

        @Override
        public void close() {
            typedValues.close();
            windowCompat.close();
        }
    }

    private WindowInsetsControllerCompat invokeSetHidden(String bar) throws Exception {
        SystemBars plugin = new SystemBars();
        Bridge bridge = mock(Bridge.class);
        AppCompatActivity activity = mock(AppCompatActivity.class);
        Window window = mock(Window.class);
        View decorView = mock(View.class);
        WindowInsetsControllerCompat controller = mock(WindowInsetsControllerCompat.class);

        when(bridge.getActivity()).thenReturn(activity);
        when(activity.getWindow()).thenReturn(window);
        when(window.getDecorView()).thenReturn(decorView);

        plugin.setBridge(bridge);

        try (MockedStatic<WindowCompat> windowCompat = mockStatic(WindowCompat.class)) {
            windowCompat.when(() -> WindowCompat.getInsetsController(window, decorView)).thenReturn(controller);

            Method setHidden = SystemBars.class.getDeclaredMethod("setHidden", boolean.class, String.class);
            setHidden.setAccessible(true);
            setHidden.invoke(plugin, false, bar);
        }

        return controller;
    }
}
